import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ schoolId: string; studentId: string }> }
) {
  const { schoolId, studentId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const membership =
    user.membership?.schoolId === schoolId && user.membership.active
      ? user.membership
      : null;

  if (!membership) {
    return NextResponse.json({ error: "School access required" }, { status: 403 });
  }

  if (membership.role === "STUDENT") {
    const student = await db.student.findFirst({
      where: { id: studentId, schoolId, userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "You cannot view these fees" }, { status: 403 });
    }
  } else if (membership.role === "PARENT") {
    const parent = await db.parent.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    const link = parent
      ? await db.parentStudent.findFirst({
          where: {
            parentId: parent.id,
            studentId,
            approved: true,
            student: { schoolId },
          },
          select: { id: true },
        })
      : null;

    if (!link) {
      return NextResponse.json({ error: "You cannot view these fees" }, { status: 403 });
    }
  } else if (membership.role !== "ADMIN" && membership.role !== "CASHIER") {
    return NextResponse.json({ error: "Fee access required" }, { status: 403 });
  }
  const fee = await db.feeRecord.findFirst({
    where: { schoolId, studentId },
    include: {
      student: { select: { id: true, admissionId: true, firstName: true, lastName: true } },
    },
  });

  if (!fee) return NextResponse.json({ error: "Fee record not found" }, { status: 404 });

  const payments = await db.payment.findMany({
    where: { schoolId, studentId },
    orderBy: { paidAt: "desc" },
  });

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return NextResponse.json({
    fee,
    payments,
    totalPaid,
    balance: fee.totalFee - totalPaid,
  });
}
