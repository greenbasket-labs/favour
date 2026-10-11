import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const user = await getCurrentUser();
  const { schoolId } = await params;

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const membership = await db.schoolMembership.findUnique({
    where: { schoolId_userId: { schoolId, userId: user.id } },
  });

  if (!membership || !membership.active) {
    return NextResponse.json(
      { error: "School access required" },
      { status: 403 }
    );
  }

  const cashiers = await db.schoolMembership.findMany({
    where: { schoolId, role: "CASHIER" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cashier: {
            select: {
              cashierCode: true,
              approved: true,
            },
          },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(
    cashiers.map((item) => ({
      id: item.user.id,
      membershipId: item.id,
      name: item.user.name,
      email: item.user.email,
      phone: item.user.phone,
      role: item.role,
      cashierCode: item.user.cashier?.cashierCode ?? null,
      approved: item.user.cashier?.approved ?? false,
      membershipActive: item.active,
      joinedAt: item.createdAt,
      endedAt: item.endedAt,
      endReason: item.endReason,
    }))
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Non-academic staff must be added or approved by the school administrator through the school's staff workflow.",
    },
    { status: 410 }
  );
}