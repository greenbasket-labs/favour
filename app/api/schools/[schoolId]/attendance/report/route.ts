
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type ReportPeriod = "daily" | "weekly" | "monthly" | "termly" | "yearly";

type TermName = "first" | "second" | "third";

function parseSettings(value: string | null): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Missing or invalid settings are handled by term-date validation.
  }

  return {};
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRange(
  period: ReportPeriod,
  dateValue: string,
  yearValue: string | null,
  termValue: string | null,
  settings: Record<string, unknown>
): { start: Date; endExclusive: Date; label: string } | { error: string } {
  const selectedDate = parseDate(dateValue);

  if (!selectedDate) {
    return { error: "A valid date in YYYY-MM-DD format is required." };
  }

  if (period === "daily") {
    return {
      start: selectedDate,
      endExclusive: addDays(selectedDate, 1),
      label: `Daily report - ${dateValue}`,
    };
  }

  if (period === "weekly") {
    const mondayOffset = (selectedDate.getUTCDay() + 6) % 7;
    const start = addDays(selectedDate, -mondayOffset);
    const sunday = addDays(start, 6);

    return {
      start,
      endExclusive: addDays(sunday, 1),
      label: `Weekly report - ${dateString(start)} to ${dateString(sunday)}`,
    };
  }

  if (period === "monthly") {
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const start = new Date(Date.UTC(year, month, 1));
    const endExclusive = new Date(Date.UTC(year, month + 1, 1));

    return {
      start,
      endExclusive,
      label: `Monthly report - ${year}-${String(month + 1).padStart(2, "0")}`,
    };
  }

  if (period === "yearly") {
    const year = yearValue ? Number(yearValue) : selectedDate.getUTCFullYear();

    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      return { error: "Select a valid calendar year." };
    }

    return {
      start: new Date(Date.UTC(year, 0, 1)),
      endExclusive: new Date(Date.UTC(year + 1, 0, 1)),
      label: `Yearly report - Calendar year ${year}`,
    };
  }

  const term = termValue as TermName | null;

  if (!term || !["first", "second", "third"].includes(term)) {
    return { error: "Select the first, second, or third term." };
  }

  const prefix = `${term}Term`;
  const startValue = settings[`${prefix}StartDate`];
  const endValue = settings[`${prefix}EndDate`];

  if (typeof startValue !== "string" || typeof endValue !== "string") {
    return {
      error: `The ${term} term dates are not configured in school settings.`,
    };
  }

  const start = parseDate(startValue);
  const end = parseDate(endValue);

  if (!start || !end || start.getTime() > end.getTime()) {
    return {
      error: `The ${term} term dates are missing or invalid in school settings.`,
    };
  }

  return {
    start,
    endExclusive: addDays(end, 1),
    label: `${term.charAt(0).toUpperCase() + term.slice(1)} Term - ${startValue} to ${endValue}`,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const user = await getCurrentUser();

    if (!user?.membership || user.membership.schoolId !== schoolId) {
      return NextResponse.json(
        { error: "School access required" },
        { status: 403 }
      );
    }

    const role = user.membership.role;

    if (role !== "ADMIN" && role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only administrators and teachers can view attendance reports." },
        { status: 403 }
      );
    }

    const school = await db.school.findUnique({
      where: { id: schoolId },
      select: { schoolSettings: true },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const periodValue = searchParams.get("period") ?? "daily";

    if (
      !["daily", "weekly", "monthly", "termly", "yearly"].includes(
        periodValue
      )
    ) {
      return NextResponse.json(
        { error: "Unsupported reporting period." },
        { status: 400 }
      );
    }

    const period = periodValue as ReportPeriod;
    const dateValue = searchParams.get("date") ?? dateString(new Date());
    const requestedClassId = searchParams.get("classId");
    const settings = parseSettings(school.schoolSettings);

    const range = getDateRange(
      period,
      dateValue,
      searchParams.get("year"),
      searchParams.get("term"),
      settings
    );

    if ("error" in range) {
      return NextResponse.json({ error: range.error }, { status: 400 });
    }

    let allowedClassIds: string[] | null = null;

    if (role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true, approved: true },
      });

      if (!teacher?.approved) {
        return NextResponse.json(
          { error: "Teacher is not approved." },
          { status: 403 }
        );
      }

      const assignments = await db.classTeacher.findMany({
        where: { schoolId, teacherId: teacher.id },
        select: { classId: true },
      });

      allowedClassIds = assignments.map((item) => item.classId);

      if (
        requestedClassId &&
        !allowedClassIds.includes(requestedClassId)
      ) {
        return NextResponse.json(
          { error: "You cannot view attendance for this class." },
          { status: 403 }
        );
      }
    }

    const classes = await db.schoolClass.findMany({
      where: {
        schoolId,
        ...(requestedClassId ? { id: requestedClassId } : {}),
        ...(allowedClassIds ? { id: { in: allowedClassIds } } : {}),
      },
      select: {
        id: true,
        name: true,
        arm: true,
      },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    });

    if (requestedClassId && classes.length === 0) {
      return NextResponse.json(
        { error: "Class not found or unavailable to your account." },
        { status: 404 }
      );
    }

    const classIds = classes.map((item) => item.id);

    if (classIds.length === 0) {
      return NextResponse.json({
        period,
        label: range.label,
        startDate: dateString(range.start),
        endDate: dateString(addDays(range.endExclusive, -1)),
        classes: [],
        summary: {
          totalStudents: 0,
          markedStudents: 0,
          studentsPresent: 0,
          studentsAbsent: 0,
          attendanceRecords: 0,
          presentRecords: 0,
          absentRecords: 0,
          attendancePercentage: 0,
        },
      });
    }

    const [students, records] = await Promise.all([
      db.student.findMany({
        where: { schoolId, classId: { in: classIds } },
        select: {
          id: true,
          admissionId: true,
          firstName: true,
          lastName: true,
          gender: true,
          classId: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      }),
      db.attendance.findMany({
        where: {
          schoolId,
          classId: { in: classIds },
          date: {
            gte: range.start,
            lt: range.endExclusive,
          },
        },
        select: {
          studentId: true,
          classId: true,
          date: true,
          session: true,
          present: true,
        },
        orderBy: [{ date: "asc" }, { session: "asc" }],
      }),
    ]);

    const reports = classes.map((schoolClass) => {
      const classStudents = students.filter(
        (student) => student.classId === schoolClass.id
      );

      const classRecords = records.filter(
        (record) => record.classId === schoolClass.id
      );

      const studentReports = classStudents.map((student) => {
        const studentRecords = classRecords.filter(
          (record) => record.studentId === student.id
        );

        const markedDays = new Map<string, boolean>();

        for (const record of studentRecords) {
          const day = dateString(record.date);
          markedDays.set(
            day,
            (markedDays.get(day) ?? false) || record.present
          );
        }

        const morningRecords = studentRecords.filter(
          (record) => record.session.toLowerCase() === "morning"
        );
        const afternoonRecords = studentRecords.filter(
          (record) => record.session.toLowerCase() === "afternoon"
        );

        const presentRecords = studentRecords.filter(
          (record) => record.present
        ).length;

        const absentRecords = studentRecords.length - presentRecords;
        const daysPresent = [...markedDays.values()].filter(Boolean).length;
        const daysAbsent = markedDays.size - daysPresent;

        return {
          id: student.id,
          admissionId: student.admissionId,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          attendanceRecords: studentRecords.length,
          presentRecords,
          absentRecords,
          daysMarked: markedDays.size,
          daysPresent,
          daysAbsent,
          morningPresent: morningRecords.filter((r) => r.present).length,
          morningAbsent: morningRecords.filter((r) => !r.present).length,
          afternoonPresent: afternoonRecords.filter((r) => r.present).length,
          afternoonAbsent: afternoonRecords.filter((r) => !r.present).length,
        };
      });

      const attendanceRecords = classRecords.length;
      const presentRecords = classRecords.filter((r) => r.present).length;
      const absentRecords = attendanceRecords - presentRecords;
      const markedStudents = studentReports.filter(
        (student) => student.attendanceRecords > 0
      ).length;
      const studentsPresent = studentReports.filter(
        (student) => student.presentRecords > 0
      ).length;
      const studentsAbsent = markedStudents - studentsPresent;

      return {
        id: schoolClass.id,
        name: schoolClass.name,
        arm: schoolClass.arm,
        summary: {
          totalStudents: classStudents.length,
          markedStudents,
          studentsPresent,
          studentsAbsent,
          unmarkedStudents: classStudents.length - markedStudents,
          attendanceRecords,
          presentRecords,
          absentRecords,
          morningPresent: classRecords.filter(
            (r) => r.session.toLowerCase() === "morning" && r.present
          ).length,
          morningAbsent: classRecords.filter(
            (r) => r.session.toLowerCase() === "morning" && !r.present
          ).length,
          afternoonPresent: classRecords.filter(
            (r) => r.session.toLowerCase() === "afternoon" && r.present
          ).length,
          afternoonAbsent: classRecords.filter(
            (r) => r.session.toLowerCase() === "afternoon" && !r.present
          ).length,
          attendancePercentage:
            attendanceRecords > 0
              ? Math.round((presentRecords / attendanceRecords) * 10000) / 100
              : 0,
        },
        students: studentReports,
      };
    });

    const allStudents = reports.flatMap((item) => item.students);
    const attendanceRecords = records.length;
    const presentRecords = records.filter((r) => r.present).length;
    const markedStudents = allStudents.filter(
      (student) => student.attendanceRecords > 0
    ).length;
    const studentsPresent = allStudents.filter(
      (student) => student.presentRecords > 0
    ).length;

    return NextResponse.json({
      period,
      label: range.label,
      startDate: dateString(range.start),
      endDate: dateString(addDays(range.endExclusive, -1)),
      classes: reports,
      summary: {
        totalStudents: allStudents.length,
        markedStudents,
        studentsPresent,
        studentsAbsent: markedStudents - studentsPresent,
        unmarkedStudents: allStudents.length - markedStudents,
        attendanceRecords,
        presentRecords,
        absentRecords: attendanceRecords - presentRecords,
        morningPresent: records.filter(
          (r) => r.session.toLowerCase() === "morning" && r.present
        ).length,
        morningAbsent: records.filter(
          (r) => r.session.toLowerCase() === "morning" && !r.present
        ).length,
        afternoonPresent: records.filter(
          (r) => r.session.toLowerCase() === "afternoon" && r.present
        ).length,
        afternoonAbsent: records.filter(
          (r) => r.session.toLowerCase() === "afternoon" && !r.present
        ).length,
        attendancePercentage:
          attendanceRecords > 0
            ? Math.round((presentRecords / attendanceRecords) * 10000) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Attendance report error:", error);

    return NextResponse.json(
      { error: "Unable to generate the attendance report." },
      { status: 500 }
    );
  }
}
