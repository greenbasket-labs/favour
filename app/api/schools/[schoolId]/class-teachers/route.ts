
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { hashSchoolIdentityPin } from "@/lib/school-identity-auth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const user = await getCurrentUser();
  const { schoolId } = await params;

  if (!user?.membership || user.membership.schoolId !== schoolId) {
    return NextResponse.json(
      { error: "School access required" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    await db.classTeacher.findMany({
      where: { schoolId },
      include: {
        teacher: {
          include: { user: { select: { name: true, email: true } } },
        },
        class: { include: { section: true } },
      },
    })
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const user = await getCurrentUser();
  const { schoolId } = await params;

  if (
    !user?.membership ||
    user.membership.schoolId !== schoolId ||
    user.membership.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const teacherId =
    typeof body?.teacherId === "string" ? body.teacherId : "";
  const classId =
    typeof body?.classId === "string" ? body.classId : "";

  if (!teacherId || !classId) {
    return NextResponse.json(
      { error: "teacherId and classId are required" },
      { status: 400 }
    );
  }

  const [teacher, schoolClass] = await Promise.all([
    db.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
        approved: true,
        user: {
          memberships: {
            some: { schoolId, active: true, role: "TEACHER" },
          },
        },
      },
    }),
    db.schoolClass.findFirst({
      where: { id: classId, schoolId },
    }),
  ]);

  if (!teacher) {
    return NextResponse.json(
      { error: "Approved teacher not found" },
      { status: 404 }
    );
  }

  if (!schoolClass) {
    return NextResponse.json(
      { error: "Class not found" },
      { status: 404 }
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const [subjectDutyCount, classMasterDutyCount] = await Promise.all([
        tx.teacherAssignment.count({
          where: { schoolId, teacherId },
        }),
        tx.classTeacher.count({
          where: { schoolId, teacherId },
        }),
      ]);

      const isFirstDuty =
        subjectDutyCount === 0 &&
        classMasterDutyCount === 0 &&
        !teacher.pinHash;

      const assignment = await tx.classTeacher.upsert({
        where: { classId },
        update: { schoolId, teacherId },
        create: { schoolId, classId, teacherId },
      });

      let activationPin: string | undefined;

      if (isFirstDuty) {
        activationPin = randomInt(100000, 1000000).toString();

        await tx.teacher.update({
          where: { id: teacherId },
          data: {
            activationPinHash: hashSchoolIdentityPin(activationPin),
            activationExpiresAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ),
            pinFailedAttempts: 0,
            pinLockedUntil: null,
          },
        });
      }

      return { assignment, activationPin };
    });

    await recordAudit({
      schoolId,
      actorUserId: user.id,
      action: "UPSERT",
      entity: "CLASS_TEACHER",
      entityId: result.assignment.id,
      details: {
        teacherId,
        classId,
        activationPinIssued: Boolean(result.activationPin),
      },
    });

    return NextResponse.json(
      {
        classTeacher: result.assignment,
        ...(result.activationPin
          ? { activationPin: result.activationPin }
          : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save class-master assignment:", error);

    return NextResponse.json(
      { error: "Could not save the class-master assignment" },
      { status: 500 }
    );
  }
}
