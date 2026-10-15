
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createTrustedIdentityDevice,
  findIdentityByCode,
  hashSchoolIdentityPin,
  recordIdentityPinFailure,
  setSchoolIdentitySession,
  verifySchoolIdentityPin,
} from "@/lib/school-identity-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const teacherCode =
      typeof body.teacherCode === "string" ? body.teacherCode.trim() : "";
    const activationPin =
      typeof body.activationPin === "string" ? body.activationPin.trim() : "";
    const newPin =
      typeof body.newPin === "string" ? body.newPin.trim() : "";

    if (!teacherCode || !activationPin || !newPin) {
      return NextResponse.json(
        { error: "Teacher ID, temporary PIN, and new PIN are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(activationPin)) {
      return NextResponse.json(
        { error: "The temporary PIN must contain 6 digits." },
        { status: 400 }
      );
    }

    if (!/^\d{4,8}$/.test(newPin)) {
      return NextResponse.json(
        { error: "Your permanent PIN must contain 4 to 8 digits." },
        { status: 400 }
      );
    }

    const identity = await findIdentityByCode("TEACHER", teacherCode);

    if (
      !identity ||
      !identity.schoolId ||
      !identity.active ||
      !identity.approved
    ) {
      return NextResponse.json(
        { error: "Invalid Teacher ID or teacher account unavailable." },
        { status: 400 }
      );
    }

    const now = new Date();

    if (identity.pinLockedUntil && identity.pinLockedUntil > now) {
      return NextResponse.json(
        {
          error: "Too many failed attempts. Try again after the lockout period.",
        },
        { status: 423 }
      );
    }

    if (!identity.activationPinHash || !identity.activationExpiresAt) {
      return NextResponse.json(
        {
          error:
            "No valid activation PIN exists. Ask the school administrator to issue one.",
        },
        { status: 400 }
      );
    }

    if (identity.activationExpiresAt <= now) {
      await db.teacher.updateMany({
        where: {
          id: identity.id,
          activationPinHash: identity.activationPinHash,
          activationExpiresAt: { lte: now },
        },
        data: {
          activationPinHash: null,
          activationExpiresAt: null,
        },
      });

      return NextResponse.json(
        {
          error:
            "The activation PIN has expired. Ask the administrator for a new one.",
        },
        { status: 400 }
      );
    }

    const pinIsValid = verifySchoolIdentityPin(
      activationPin,
      identity.activationPinHash
    );

    if (!pinIsValid) {
      const result = await recordIdentityPinFailure(identity);

      return NextResponse.json(
        {
          error: result.locked
            ? "Too many failed attempts. Your access is temporarily locked."
            : "Incorrect activation PIN.",
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: result.locked ? 423 : 400 }
      );
    }

    const newPinHash = hashSchoolIdentityPin(newPin);

    // Consume the activation PIN and revoke existing devices atomically.
    const activation = await db.$transaction(async (tx) => {
      const updated = await tx.teacher.updateMany({
        where: {
          id: identity.id,
          active: true,
          approved: true,
          activationPinHash: identity.activationPinHash,
          activationExpiresAt: { gt: new Date() },
          OR: [
            { pinLockedUntil: null },
            { pinLockedUntil: { lte: new Date() } },
          ],
        },
        data: {
          pinHash: newPinHash,
          activationPinHash: null,
          activationExpiresAt: null,
          pinFailedAttempts: 0,
          pinLockedUntil: null,
        },
      });

      if (updated.count !== 1) {
        return false;
      }

      await tx.deviceSession.updateMany({
        where: {
          teacherId: identity.id,
          userId: null,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      return true;
    });

    if (!activation) {
      return NextResponse.json(
        {
          error:
            "This activation PIN has already been used or has expired. Request a new one.",
        },
        { status: 409 }
      );
    }

    // Create the new trusted device only after the transaction commits.
    const activatedIdentity = {
      ...identity,
      pinHash: newPinHash,
      activationPinHash: null,
      activationExpiresAt: null,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
    };

    try {
      const response = NextResponse.json({
        success: true,
        message: "Teacher activation successful.",
        teacher: {
          id: identity.id,
          teacherCode: identity.code,
          name: identity.name,
          schoolId: identity.schoolId,
        },
        redirectTo: "/dashboard",
      });

      const deviceId = await createTrustedIdentityDevice(
        activatedIdentity,
        response
      );

      setSchoolIdentitySession(response, activatedIdentity, deviceId);

      return response;
    } catch (error) {
      console.error("Teacher device setup failed after activation:", error);

      return NextResponse.json(
        {
          success: true,
          activated: true,
          requiresSignIn: true,
          error:
            "Your permanent PIN was saved, but this device could not be registered. Please sign in again or ask the administrator for help.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Teacher activation failed:", error);

    return NextResponse.json(
      { error: "Teacher activation failed. Please try again." },
      { status: 500 }
    );
  }
}
