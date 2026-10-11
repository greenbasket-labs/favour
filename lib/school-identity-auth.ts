import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPin, verifyPin } from "@/lib/auth";

export type SchoolIdentityType = "TEACHER" | "STUDENT" | "PARENT" | "CASHIER";

export type SchoolIdentity = {
  type: SchoolIdentityType;
  id: string;
  code: string;
  schoolId: string | null;
  name: string;
  active: boolean;
  approved: boolean;
  pinHash: string | null;
  activationPinHash: string | null;
  activationExpiresAt: Date | null;
  pinFailedAttempts: number;
  pinLockedUntil: Date | null;
};

type IdentitySession = {
  type: SchoolIdentityType;
  identityId: string;
  deviceId: string;
  exp: number;
};

const SESSION_COOKIE = "skulgo_identity_session";
const DEVICE_COOKIE_PREFIX = "skulgo_identity_device_";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const DEVICE_MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return "skulgo-dev-session-secret-change-me";
}

function deviceCookieName(type: SchoolIdentityType, id: string) {
  const key = createHmac("sha256", secret())
    .update(`identity-cookie:${type}:${id}`)
    .digest("hex")
    .slice(0, 32);
  return `${DEVICE_COOKIE_PREFIX}${key}`;
}

function deviceHash(token: string) {
  return createHmac("sha256", secret()).update(`identity-device:${token}`).digest("hex");
}

function encodeSession(session: IdentitySession) {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function decodeSession(token: string): IdentitySession | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", secret()).update(body).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    const types: SchoolIdentityType[] = ["TEACHER", "STUDENT", "PARENT", "CASHIER"];
    if (
      !types.includes(value.type) ||
      typeof value.identityId !== "string" ||
      typeof value.deviceId !== "string" ||
      typeof value.exp !== "number" ||
      value.exp <= Math.floor(Date.now() / 1000)
    ) return null;

    return value as IdentitySession;
  } catch {
    return null;
  }
}

function normalizeIdentity(
  type: SchoolIdentityType,
  row: {
    id: string;
    schoolId: string | null;
    code: string;
    name: string;
    active: boolean;
    approved: boolean;
    pinHash: string | null;
    activationPinHash: string | null;
    activationExpiresAt: Date | null;
    pinFailedAttempts: number;
    pinLockedUntil: Date | null;
  }
): SchoolIdentity {
  return { type, ...row };
}

export async function findIdentityByCode(
  type: SchoolIdentityType,
  suppliedCode: string
): Promise<SchoolIdentity | null> {
  const code = suppliedCode.trim().toUpperCase();
  if (!code) return null;

  switch (type) {
    case "TEACHER": {
      const row = await db.teacher.findUnique({
        where: { teacherCode: code },
        select: {
          id: true, schoolId: true, teacherCode: true, name: true,
          active: true, approved: true, pinHash: true,
          activationPinHash: true, activationExpiresAt: true,
          pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("TEACHER", {
        ...row, code: row.teacherCode, name: row.name ?? "",
      }) : null;
    }
    case "STUDENT": {
      const row = await db.student.findUnique({
        where: { admissionId: code },
        select: {
          id: true, schoolId: true, admissionId: true, firstName: true, lastName: true,
          active: true, pinHash: true, activationPinHash: true,
          activationExpiresAt: true, pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("STUDENT", {
        ...row, code: row.admissionId, name: `${row.firstName} ${row.lastName}`.trim(),
        approved: true,
      }) : null;
    }
    case "PARENT": {
      const row = await db.parent.findUnique({
        where: { parentCode: code },
        select: {
          id: true, schoolId: true, parentCode: true, name: true,
          active: true, pinHash: true, activationPinHash: true,
          activationExpiresAt: true, pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("PARENT", {
        ...row, code: row.parentCode ?? "", name: row.name ?? "", approved: true,
      }) : null;
    }
    case "CASHIER": {
      const row = await db.cashier.findUnique({
        where: { cashierCode: code },
        select: {
          id: true, schoolId: true, cashierCode: true, name: true,
          active: true, approved: true, pinHash: true,
          activationPinHash: true, activationExpiresAt: true,
          pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("CASHIER", {
        ...row, code: row.cashierCode, name: row.name ?? "",
      }) : null;
    }
  }
}

async function findIdentityById(
  type: SchoolIdentityType,
  id: string
): Promise<SchoolIdentity | null> {
  switch (type) {
    case "TEACHER": {
      const row = await db.teacher.findUnique({
        where: { id },
        select: {
          id: true, schoolId: true, teacherCode: true, name: true,
          active: true, approved: true, pinHash: true,
          activationPinHash: true, activationExpiresAt: true,
          pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("TEACHER", {
        ...row, code: row.teacherCode, name: row.name ?? "",
      }) : null;
    }
    case "STUDENT": {
      const row = await db.student.findUnique({
        where: { id },
        select: {
          id: true, schoolId: true, admissionId: true, firstName: true, lastName: true,
          active: true, pinHash: true, activationPinHash: true,
          activationExpiresAt: true, pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("STUDENT", {
        ...row, code: row.admissionId, name: `${row.firstName} ${row.lastName}`.trim(),
        approved: true,
      }) : null;
    }
    case "PARENT": {
      const row = await db.parent.findUnique({
        where: { id },
        select: {
          id: true, schoolId: true, parentCode: true, name: true,
          active: true, pinHash: true, activationPinHash: true,
          activationExpiresAt: true, pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("PARENT", {
        ...row, code: row.parentCode ?? "", name: row.name ?? "", approved: true,
      }) : null;
    }
    case "CASHIER": {
      const row = await db.cashier.findUnique({
        where: { id },
        select: {
          id: true, schoolId: true, cashierCode: true, name: true,
          active: true, approved: true, pinHash: true,
          activationPinHash: true, activationExpiresAt: true,
          pinFailedAttempts: true, pinLockedUntil: true,
        },
      });
      return row ? normalizeIdentity("CASHIER", {
        ...row, code: row.cashierCode, name: row.name ?? "",
      }) : null;
    }
  }
}

function ownerWhere(type: SchoolIdentityType, id: string) {
  return {
    userId: null,
    teacherId: type === "TEACHER" ? id : null,
    studentId: type === "STUDENT" ? id : null,
    parentId: type === "PARENT" ? id : null,
    cashierId: type === "CASHIER" ? id : null,
  };
}

export async function findTrustedIdentityDevice(identity: SchoolIdentity) {
  const cookieStore = await cookies();
  const token = cookieStore.get(deviceCookieName(identity.type, identity.id))?.value;
  if (!token) return null;

  return db.deviceSession.findFirst({
    where: {
      ...ownerWhere(identity.type, identity.id),
      deviceHash: deviceHash(token),
      revokedAt: null,
    },
    select: { id: true },
  });
}

export async function createTrustedIdentityDevice(
  identity: SchoolIdentity,
  response: Response
) {
  const rawToken = randomBytes(32).toString("base64url");
  const now = new Date();

  const device = await db.deviceSession.create({
    data: {
      ...ownerWhere(identity.type, identity.id),
      deviceHash: deviceHash(rawToken),
      createdAt: now,
      lastSeenAt: now,
    },
    select: { id: true },
  });

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${deviceCookieName(identity.type, identity.id)}=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DEVICE_MAX_AGE}${secure}`
  );

  return device.id;
}

export function setSchoolIdentitySession(
  response: Response,
  identity: SchoolIdentity,
  deviceId: string
) {
  const token = encodeSession({
    type: identity.type,
    identityId: identity.id,
    deviceId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`
  );
}

export async function clearSchoolIdentitySession(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export async function getCurrentSchoolIdentity(): Promise<SchoolIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = decodeSession(token);
  if (!session) return null;

  const identity = await findIdentityById(session.type, session.identityId);
  if (
    !identity ||
    !identity.active ||
    !identity.approved ||
    !identity.pinHash ||
    (identity.pinLockedUntil && identity.pinLockedUntil > new Date())
  ) return null;

  const cookieToken = cookieStore.get(
    deviceCookieName(identity.type, identity.id)
  )?.value;
  if (!cookieToken) return null;

  const device = await db.deviceSession.findFirst({
    where: {
      id: session.deviceId,
      ...ownerWhere(identity.type, identity.id),
      deviceHash: deviceHash(cookieToken),
      revokedAt: null,
    },
    select: { id: true, lastSeenAt: true },
  });
  if (!device) return null;

  await db.deviceSession.update({
    where: { id: device.id },
    data: { lastSeenAt: new Date() },
  });

  return identity;
}

const MAX_IDENTITY_PIN_ATTEMPTS = 3;
const IDENTITY_PIN_LOCKOUT_HOURS = 24;

export function hashSchoolIdentityPin(pin: string) {
  return hashPin(pin);
}

export function verifySchoolIdentityPin(pin: string, storedHash: string) {
  return verifyPin(pin, storedHash);
}

async function updateIdentityPinSecurity(
  identity: SchoolIdentity,
  data: { pinFailedAttempts?: number | { increment: number }; pinLockedUntil?: Date | null }
) {
  switch (identity.type) {
    case "TEACHER":
      return db.teacher.update({ where: { id: identity.id }, data });
    case "STUDENT":
      return db.student.update({ where: { id: identity.id }, data });
    case "PARENT":
      return db.parent.update({ where: { id: identity.id }, data });
    case "CASHIER":
      return db.cashier.update({ where: { id: identity.id }, data });
  }
}

export async function resetIdentityPinFailures(identity: SchoolIdentity) {
  await updateIdentityPinSecurity(identity, {
    pinFailedAttempts: 0,
    pinLockedUntil: null,
  });
}

async function incrementIdentityPinFailures(identity: SchoolIdentity, now: Date) {
  const where = {
    id: identity.id,
    OR: [
      { pinLockedUntil: null },
      { pinLockedUntil: { lte: now } },
    ],
  };
  const data = { pinFailedAttempts: { increment: 1 } };

  switch (identity.type) {
    case "TEACHER":
      return db.teacher.updateMany({ where, data });
    case "STUDENT":
      return db.student.updateMany({ where, data });
    case "PARENT":
      return db.parent.updateMany({ where, data });
    case "CASHIER":
      return db.cashier.updateMany({ where, data });
  }
}

async function lockIdentityIfThresholdReached(
  identity: SchoolIdentity,
  lockedUntil: Date,
  now: Date
) {
  const where = {
    id: identity.id,
    pinFailedAttempts: { gte: MAX_IDENTITY_PIN_ATTEMPTS },
    OR: [
      { pinLockedUntil: null },
      { pinLockedUntil: { lte: now } },
    ],
  };
  const data = {
    pinFailedAttempts: 0,
    pinLockedUntil: lockedUntil,
  };

  switch (identity.type) {
    case "TEACHER":
      return db.teacher.updateMany({ where, data });
    case "STUDENT":
      return db.student.updateMany({ where, data });
    case "PARENT":
      return db.parent.updateMany({ where, data });
    case "CASHIER":
      return db.cashier.updateMany({ where, data });
  }
}

export async function recordIdentityPinFailure(identity: SchoolIdentity) {
  const now = new Date();

  if (identity.pinLockedUntil && identity.pinLockedUntil > now) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: identity.pinLockedUntil,
    };
  }

  await incrementIdentityPinFailures(identity, now);

  const updated = await findIdentityById(identity.type, identity.id);
  if (!updated) {
    return { locked: true, attemptsRemaining: 0, lockedUntil: null };
  }

  if (updated.pinLockedUntil && updated.pinLockedUntil > now) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: updated.pinLockedUntil,
    };
  }

  if (updated.pinFailedAttempts >= MAX_IDENTITY_PIN_ATTEMPTS) {
    const lockedUntil = new Date(
      now.getTime() + IDENTITY_PIN_LOCKOUT_HOURS * 60 * 60 * 1000
    );

    const result = await lockIdentityIfThresholdReached(
      updated,
      lockedUntil,
      now
    );

    const latest = await findIdentityById(identity.type, identity.id);

    if (latest?.pinLockedUntil && latest.pinLockedUntil > now) {
      return {
        locked: true,
        attemptsRemaining: 0,
        lockedUntil: latest.pinLockedUntil,
      };
    }

    if (result.count === 0) {
      return {
        locked: false,
        attemptsRemaining: Math.max(
          0,
          MAX_IDENTITY_PIN_ATTEMPTS - (latest?.pinFailedAttempts ?? 0)
        ),
        lockedUntil: null,
      };
    }
  }

  return {
    locked: false,
    attemptsRemaining: Math.max(
      0,
      MAX_IDENTITY_PIN_ATTEMPTS - updated.pinFailedAttempts
    ),
    lockedUntil: null,
  };
}
