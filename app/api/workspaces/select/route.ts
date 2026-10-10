import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, setSession, verifyPin } from "@/lib/auth";

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const membershipId = String(body?.membershipId ?? "").trim();
  const pin = String(body?.pin ?? "").trim();

  if (!membershipId) {
    return NextResponse.json({ error: "Workspace is required." }, { status: 400 });
  }

  if (!/^[0-9]{4,6}$/.test(pin)) {
    return NextResponse.json({ error: "Enter a valid 4–6 digit PIN." }, { status: 400 });
  }

  const membership = await db.schoolMembership.findFirst({
    where: { id: membershipId, userId: user.id, active: true },
    select: { id: true, schoolId: true, role: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const account = await db.user.findUnique({
    where: { id: user.id },
    select: { pinHash: true, pinFailedAttempts: true, pinLockedUntil: true },
  });

  if (!account?.pinHash) {
    return NextResponse.json({
      error: "Set up your PIN before entering the workspace.",
      setupRequired: true,
    }, { status: 409 });
  }

  const now = new Date();

  if (account.pinLockedUntil && account.pinLockedUntil > now) {
    return NextResponse.json({
      error: "Too many incorrect PIN attempts. Please try again later.",
    }, { status: 429 });
  }

  if (!verifyPin(pin, account.pinHash)) {
    const attempts =
      account.pinLockedUntil && account.pinLockedUntil <= now
        ? 0
        : account.pinFailedAttempts;
    const nextAttempts = attempts + 1;
    const locked = nextAttempts >= MAX_PIN_ATTEMPTS;

    await db.user.update({
      where: { id: user.id },
      data: {
        pinFailedAttempts: locked ? 0 : nextAttempts,
        pinLockedUntil: locked
          ? new Date(now.getTime() + PIN_LOCKOUT_MINUTES * 60 * 1000)
          : null,
      },
    });

    return NextResponse.json({
      error: locked
        ? "Too many incorrect PIN attempts. Your PIN is locked for 15 minutes."
        : "Incorrect PIN.",
    }, { status: locked ? 429 : 401 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { pinFailedAttempts: 0, pinLockedUntil: null },
  });

  const response = NextResponse.json({
    ok: true,
    schoolId: membership.schoolId,
    role: membership.role,
  });

  setSession(response, { id: user.id }, membership.id, user.session.deviceId);
  return response;
}
