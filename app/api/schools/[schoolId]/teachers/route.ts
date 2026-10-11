import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
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

  const teachers = await db.teacher.findMany({
    where: {
      user: {
        memberships: {
          some: { schoolId, role: "TEACHER" },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          memberships: {
            where: { schoolId, role: "TEACHER" },
            select: {
              id: true,
              active: true,
              createdAt: true,
              endedAt: true,
              endReason: true,
            },
          },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(
    teachers.map((teacher) => {
      const linkedUser = teacher.user;

      if (!linkedUser) {
        return {
          ...teacher,
          membershipId: null,
          membershipActive: false,
          joinedAt: null,
          endedAt: null,
          endReason: null,
          user: null,
        };
      }

      const membership = linkedUser.memberships[0];

      return {
        ...teacher,
        membershipId: membership?.id ?? null,
        membershipActive: membership?.active ?? false,
        joinedAt: membership?.createdAt ?? null,
        endedAt: membership?.endedAt ?? null,
        endReason: membership?.endReason ?? null,
        user: {
          id: linkedUser.id,
          name: linkedUser.name,
          email: linkedUser.email,
          phone: linkedUser.phone,
        },
      };
    })
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Teachers must be added or approved by the school administrator through the school's staff workflow.",
    },
    { status: 410 }
  );
}