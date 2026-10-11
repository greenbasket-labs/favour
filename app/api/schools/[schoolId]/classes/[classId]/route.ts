import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

async function schoolAccess(userId: string, schoolId: string) {
  return db.schoolMembership.findFirst({
    where: { userId, schoolId, active: true },
    select: { role: true },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ schoolId: string; classId: string }> }
) {
  const user = await getCurrentUser();
  const { schoolId, classId } = await params;

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const membership = await schoolAccess(user.id, schoolId);
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const existing = await db.schoolClass.findFirst({
    where: { id: classId, schoolId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const data: { arm?: string | null; active?: boolean } = {};

  if (typeof body?.arm === "string") {
    data.arm = body.arm.trim() || null;
  }

  if (typeof body?.active === "boolean") {
    data.active = body.active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Provide an arm or active status to update" },
      { status: 400 }
    );
  }

  try {
    const schoolClass = await db.schoolClass.update({
      where: { id: existing.id },
      data,
    });

    await recordAudit({
      schoolId,
      actorUserId: user.id,
      action: "UPDATE",
      entity: "CLASS",
      entityId: schoolClass.id,
      details: {
        name: schoolClass.name,
        arm: schoolClass.arm,
        active: schoolClass.active,
      },
    });

    return NextResponse.json(schoolClass);
  } catch {
    return NextResponse.json(
      { error: "This class and arm already exists" },
      { status: 409 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Class deletion is disabled to protect school records. Disable the class instead.",
    },
    { status: 405 }
  );
}