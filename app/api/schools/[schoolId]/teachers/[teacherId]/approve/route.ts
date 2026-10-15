import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; teacherId: string }> }
) {
  const { schoolId, teacherId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const membership = await db.schoolMembership.findUnique({
    where: { schoolId_userId: { schoolId, userId: user.id } },
  });

  if (!membership?.active || membership.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Active school administrator access required" },
      { status: 403 }
    );
  }

  const teacher = await db.teacher.findFirst({
    where: { id: teacherId, schoolId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const updated = await db.teacher.update({
    where: { id: teacherId },
    data: { approved: true },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(updated);
}
