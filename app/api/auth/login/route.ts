import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrReuseDevice, setSession, verifyPin } from "@/lib/auth";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "PIN-only login is available only in local development. Production authentication must be configured first." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
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
        error: matches.length > 1
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
  const recoveryEmail = process.env.SKULGO_DEVICE_RECOVERY_EMAIL?.trim().toLowerCase();

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
