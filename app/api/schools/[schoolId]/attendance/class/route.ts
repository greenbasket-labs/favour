import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId } = await params;
  const classId = request.nextUrl.searchParams.get("classId");
  const dateValue = request.nextUrl.searchParams.get("date");
  const session = request.nextUrl.searchParams.get("session") ?? "morning";

  if (!classId || !dateValue) {
    return NextResponse.json({ error: "classId and date are required" }, { status: 400 });
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user?.membership || user.membership.schoolId !== schoolId) {
    return NextResponse.json(
      { error: "School access required" },
      { status: 403 }
    );
  }

  if (user.membership.role === "TEACHER") {
    const teacher = await db.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true, approved: true },
    });

    if (!teacher?.approved) {
      return NextResponse.json(
        { error: "Teacher is not approved" },
        { status: 403 }
      );
    }

    const assignment = await db.classTeacher.findFirst({
      where: { schoolId, classId, teacherId: teacher.id },
      select: { id: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "You cannot view attendance for this class" },
        { status: 403 }
      );
    }
  } else if (user.membership.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Attendance access required" },
      { status: 403 }
    );
  }

  const schoolClass = await db.schoolClass.findFirst({
    where: { id: classId, schoolId },
    include: {
      students: {
        orderBy: { lastName: "asc" },
        select: { id: true, admissionId: true, firstName: true, lastName: true },
      },
    },
  });

  if (!schoolClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const records = await db.attendance.findMany({
    where: { schoolId, classId, date, session },
    select: { studentId: true, present: true },
  });

  const status = new Map(records.map((record) => [record.studentId, record.present]));

  return NextResponse.json({
    class: { id: schoolClass.id, name: schoolClass.name, arm: schoolClass.arm },
    students: schoolClass.students.map((student) => ({
      ...student,
      present: status.get(student.id) ?? null,
    })),
  });
}
