import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrReuseDevice, setSession, verifyPin } from "@/lib/auth";
import {
  createTrustedIdentityDevice,
  findIdentityByCode,
  hashSchoolIdentityPin,
  recordIdentityPinFailure,
  setSchoolIdentitySession,
  verifySchoolIdentityPin,
} from "@/lib/school-identity-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const teacherCode =
    typeof body?.teacherCode === "string" ? body.teacherCode.trim() : "";
  const teacherPin =
    typeof body?.teacherPin === "string" ? body.teacherPin.trim() : "";

  // Teacher ID + permanent PIN sign-in.
  if (teacherCode || teacherPin) {
    if (!teacherCode || !/^\d{4,8}$/.test(teacherPin)) {
      return NextResponse.json(
        { error: "Enter your Teacher ID and a valid 4–8 digit permanent PIN." },
        { status: 400 }
      );
    }

    try {
      const identity = await findIdentityByCode("TEACHER", teacherCode);

      if (!identity || !identity.active || !identity.approved || !identity.schoolId) {
        return NextResponse.json(
          { error: "Invalid Teacher ID or teacher account unavailable." },
          { status: 401 }
        );
      }

      if (identity.pinLockedUntil && identity.pinLockedUntil > new Date()) {
        return NextResponse.json(
          { error: "Too many failed attempts. Try again after the lockout period." },
          { status: 423 }
        );
      }

      if (!identity.pinHash) {
        return NextResponse.json(
          { error: "Your teacher account is not activated. Use Teacher activation first." },
          { status: 403 }
        );
      }

      if (!verifySchoolIdentityPin(teacherPin, identity.pinHash)) {
        const result = await recordIdentityPinFailure(identity);

        return NextResponse.json(
          {
            error: result.locked
              ? "Too many failed attempts. Your access is temporarily locked."
              : "Incorrect Teacher ID or PIN.",
            attemptsRemaining: result.attemptsRemaining,
          },
          { status: result.locked ? 423 : 401 }
        );
      }

      // Refresh the identity after PIN verification before creating a session.
      const currentIdentity = await findIdentityByCode("TEACHER", teacherCode);

      if (
        !currentIdentity ||
        !currentIdentity.active ||
        !currentIdentity.approved ||
        !currentIdentity.pinHash ||
        currentIdentity.pinHash !== identity.pinHash ||
        (currentIdentity.pinLockedUntil &&
          currentIdentity.pinLockedUntil > new Date())
      ) {
        return NextResponse.json(
          { error: "Teacher account changed during sign-in. Please try again." },
          { status: 409 }
        );
      }

      const response = NextResponse.json({
        ok: true,
        name: currentIdentity.name,
        role: "TEACHER",
        redirectTo: "/dashboard",
      });

      const deviceId = await createTrustedIdentityDevice(
        currentIdentity,
        response
      );

      setSchoolIdentitySession(response, currentIdentity, deviceId);

      await db.teacher.update({
        where: { id: currentIdentity.id },
        data: { pinFailedAttempts: 0, pinLockedUntil: null },
      });

      return response;
    } catch (error) {
      console.error("Teacher sign-in failed:", error);

      return NextResponse.json(
        { error: "Teacher sign-in failed. Please try again." },
        { status: 500 }
      );
    }
  }

  // Existing personal PIN sign-in remains unchanged.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "PIN-only login is available only in local development. Production authentication must be configured first.",
      },
      { status: 403 }
    );
  }

  const pin = String(body?.pin ?? "").trim();

  if (!/^[0-9]{4,6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Enter a valid 4–6 digit PIN." },
      { status: 400 }
    );
  }

  const users = await db.user.findMany({
    where: { pinHash: { not: null } },
    select: {
      id: true,
      email: true,
      name: true,
      pinHash: true,
      memberships: {
        where: { active: true },
        select: {
          id: true,
          schoolId: true,
          role: true,
        },
      },
    },
  });

  const matches = users.filter(
    (user) => user.pinHash && verifyPin(pin, user.pinHash)
  );

  if (matches.length !== 1) {
    return NextResponse.json(
      {
        error:
          matches.length > 1
            ? "This PIN matches more than one account. Assign a unique PIN to each account."
            : "Incorrect PIN.",
      },
      { status: 401 }
    );
  }

  const user = matches[0];

  if (user.memberships.length !== 1) {
    return NextResponse.json(
      { error: "This account must have exactly one active school membership." },
      { status: 403 }
    );
  }

  const membership = user.memberships[0];
  const response = NextResponse.json({
    ok: true,
    name: user.name,
    role: membership.role,
  });

  let deviceId = await createOrReuseDevice(user.id, response);
  const recoveryEmail = process.env.SKULGO_DEVICE_RECOVERY_EMAIL
    ?.trim()
    .toLowerCase();

  if (!deviceId && recoveryEmail && user.email.toLowerCase() === recoveryEmail) {
    await db.deviceSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    deviceId = await createOrReuseDevice(user.id, response);
  }

  if (!deviceId) {
    return NextResponse.json(
      { error: "Maximum of 2 active devices reached." },
      { status: 429 }
    );
  }

  setSession(response, { id: user.id }, membership.id, deviceId);
  return response;
}
