import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

type Period = "daily" | "weekly" | "monthly" | "termly" | "yearly";

function dateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getRange(
  period: Period,
  dateValue: string,
  yearValue: string,
  termValue: string,
  settings: Record<string, unknown>
): { start: Date; end: Date; label: string; error?: string } {
  const date = dateOnly(dateValue) ?? dateOnly(isoDate(new Date()))!;

  if (period === "daily") {
    return {
      start: date,
      end: addDays(date, 1),
      label: `Daily - ${isoDate(date)}`,
    };
  }

  if (period === "weekly") {
    const start = addDays(date, -((date.getUTCDay() + 6) % 7));
    const sunday = addDays(start, 6);
    return {
      start,
      end: addDays(sunday, 1),
      label: `Weekly - ${isoDate(start)} to ${isoDate(sunday)}`,
    };
  }

  if (period === "monthly") {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return {
      start: new Date(Date.UTC(year, month, 1)),
      end: new Date(Date.UTC(year, month + 1, 1)),
      label: `Monthly - ${year}-${String(month + 1).padStart(2, "0")}`,
    };
  }

  if (period === "yearly") {
    const year = Number(yearValue || date.getUTCFullYear());
    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      return {
        start: date,
        end: addDays(date, 1),
        label: "Yearly report",
        error: "Select a valid calendar year.",
      };
    }

    return {
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year + 1, 0, 1)),
      label: `Yearly - Calendar year ${year}`,
    };
  }

  if (!["first", "second", "third"].includes(termValue)) {
    return {
      start: date,
      end: addDays(date, 1),
      label: "Termly report",
      error: "Select a term.",
    };
  }

  const prefix = `${termValue}Term`;
  const startValue = settings[`${prefix}StartDate`];
  const endValue = settings[`${prefix}EndDate`];
  const start = typeof startValue === "string" ? dateOnly(startValue) : null;
  const lastDay = typeof endValue === "string" ? dateOnly(endValue) : null;

  if (!start || !lastDay || start > lastDay) {
    return {
      start: date,
      end: addDays(date, 1),
      label: "Termly report",
      error: `Configure valid ${termValue} term dates in School Settings first.`,
    };
  }

  return {
    start,
    end: addDays(lastDay, 1),
    label: `${termValue.charAt(0).toUpperCase() + termValue.slice(1)} Term - ${isoDate(start)} to ${isoDate(lastDay)}`,
  };
}

function readSettings(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function genderCounts(students: { gender: string | null }[]) {
  return {
    male: students.filter(s => s.gender?.toLowerCase() === "male").length,
    female: students.filter(s => s.gender?.toLowerCase() === "female").length,
  };
}

function attendanceStats(
  students: { id: string; gender: string | null }[],
  records: { studentId: string; present: boolean; session: string }[]
) {
  const markedIds = new Set(records.map(r => r.studentId));
  const present = records.filter(r => r.present).length;
  const absent = records.length - present;
  const genders = genderCounts(students);

  return {
    total: students.length,
    ...genders,
    marked: markedIds.size,
    unmarked: Math.max(0, students.length - markedIds.size),
    present,
    absent,
    rate: records.length ? Math.round((present / records.length) * 100) : 0,
    morningPresent: records.filter(r => r.session.toLowerCase() === "morning" && r.present).length,
    morningAbsent: records.filter(r => r.session.toLowerCase() === "morning" && !r.present).length,
    afternoonPresent: records.filter(r => r.session.toLowerCase() === "afternoon" && r.present).length,
    afternoonAbsent: records.filter(r => r.session.toLowerCase() === "afternoon" && !r.present).length,
  };
}

export default async function AdminAttendance({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    classId?: string;
    period?: string;
    term?: string;
    year?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user?.membership || user.membership.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const schoolId = user.membership.schoolId;
  const params = await searchParams;
  const validPeriods: Period[] = ["daily", "weekly", "monthly", "termly", "yearly"];
  const period: Period = validPeriods.includes(params.period as Period)
    ? params.period as Period
    : "daily";
  const dateValue = dateOnly(params.date ?? "") ? params.date! : isoDate(new Date());
  const term = ["first", "second", "third"].includes(params.term ?? "")
    ? params.term!
    : "first";
  const year = params.year || dateValue.slice(0, 4);

  const school = await db.school.findUnique({
    where: { id: schoolId },
    select: { schoolSettings: true },
  });

  const settings = readSettings(school?.schoolSettings ?? null);
  const range = getRange(period, dateValue, year, term, settings);

  const classes = await db.schoolClass.findMany({
    where: { schoolId },
    include: { section: true },
    orderBy: [{ section: { name: "asc" } }, { name: "asc" }, { arm: "asc" }],
  });

  const selectedClass = params.classId
    ? classes.find(item => item.id === params.classId) ?? null
    : null;

  const students = await db.student.findMany({
    where: {
      schoolId,
      ...(selectedClass ? { classId: selectedClass.id } : {}),
    },
    select: {
      id: true,
      admissionId: true,
      firstName: true,
      lastName: true,
      gender: true,
      classId: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const records = range.error
    ? []
    : await db.attendance.findMany({
        where: {
          schoolId,
          ...(selectedClass ? { classId: selectedClass.id } : {}),
          date: { gte: range.start, lt: range.end },
        },
        select: {
          studentId: true,
          classId: true,
          date: true,
          session: true,
          present: true,
        },
        orderBy: [{ date: "asc" }, { session: "asc" }],
      });

  const classSummaries = await Promise.all(
    classes.map(async item => {
      const [classStudents, classRecords] = await Promise.all([
        db.student.findMany({
          where: { schoolId, classId: item.id },
          select: { id: true, gender: true },
        }),
        range.error
          ? Promise.resolve([])
          : db.attendance.findMany({
              where: {
                schoolId,
                classId: item.id,
                date: { gte: range.start, lt: range.end },
              },
              select: { studentId: true, present: true, session: true },
            }),
      ]);

      return {
        ...item,
        stats: attendanceStats(classStudents, classRecords),
      };
    })
  );

  const stats = attendanceStats(students, records);
  const backUrl = `/admin/attendance?date=${dateValue}&period=${period}&term=${term}&year=${year}`;

  return (
    <main className="workspace-main">
      <div className="workspace-header">
        <p className="muted">Admin workspace</p>
        <h1>Attendance</h1>
        <p className="muted">Attendance reports across classes and individual students.</p>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <form style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
          <label>
            <span className="muted">Period</span>
            <select name="period" defaultValue={period}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="termly">Termly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          <label>
            <span className="muted">Class</span>
            <select name="classId" defaultValue={selectedClass?.id ?? ""}>
              <option value="">All classes</option>
              {classes.map(item => (
                <option key={item.id} value={item.id}>
                  {item.section.name} · {item.name}{item.arm ? ` · ${item.arm}` : ""}
                </option>
              ))}
            </select>
          </label>

          {period !== "termly" && (
            <label>
              <span className="muted">{period === "yearly" ? "Reference date" : "Date"}</span>
              <input type="date" name="date" defaultValue={dateValue} />
            </label>
          )}

          {period === "yearly" && (
            <label>
              <span className="muted">Calendar year</span>
              <input type="number" name="year" min="1900" max="2200" defaultValue={year} />
            </label>
          )}

          {period === "termly" && (
            <label>
              <span className="muted">Term</span>
              <select name="term" defaultValue={term}>
                <option value="first">First Term</option>
                <option value="second">Second Term</option>
                <option value="third">Third Term</option>
              </select>
            </label>
          )}

          <button className="button" type="submit">View report</button>
        </form>
      </div>

      {range.error ? (
        <div className="card" style={{ marginBottom: 18 }}>
          <strong>Report unavailable</strong>
          <p>{range.error}</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <h2>Attendance totals</h2>
            <p className="muted">{range.label}</p>
            <div className="grid">
              <div><p className="muted">Total students</p><h2>{stats.total}</h2></div>
              <div><p className="muted">Male</p><h2>{stats.male}</h2></div>
              <div><p className="muted">Female</p><h2>{stats.female}</h2></div>
              <div><p className="muted">Present records</p><h2>{stats.present}</h2></div>
              <div><p className="muted">Absent records</p><h2>{stats.absent}</h2></div>
              <div><p className="muted">Attendance rate</p><h2>{stats.rate}%</h2></div>
            </div>
            <p className="muted">
              {stats.marked} students marked · {stats.unmarked} unmarked ·
              Records: {isoDate(range.start)} to {isoDate(addDays(range.end, -1))}
            </p>
            <p>
              Morning: {stats.morningPresent} present, {stats.morningAbsent} absent
              {" · "}
              Afternoon: {stats.afternoonPresent} present, {stats.afternoonAbsent} absent
            </p>
            <p className="muted">
              Student totals count each student once. Attendance rate uses recorded session entries.
            </p>
          </div>

          {!selectedClass ? (
            <>
              <h2>Classes</h2>
              <div className="grid">
                {classSummaries.map(item => (
                  <Link
                    className="card"
                    key={item.id}
                    href={`${backUrl}&classId=${item.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <strong>
                      {item.section.name} · {item.name}{item.arm ? ` · ${item.arm}` : ""}
                    </strong>
                    <p className="muted">
                      {item.stats.total} students · {item.stats.marked} marked · {item.stats.unmarked} unmarked
                    </p>
                    <p>
                      {item.stats.present} present records · {item.stats.absent} absent records
                    </p>
                    <p>Attendance rate: {item.stats.rate}%</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 18 }}>
                <p className="muted">Class</p>
                <h2>
                  {selectedClass.section.name} · {selectedClass.name}
                  {selectedClass.arm ? ` · ${selectedClass.arm}` : ""}
                </h2>
                <Link className="button" href={backUrl}>All classes</Link>
              </div>

              <h2>Student attendance</h2>
              <div className="grid">
                {students.map(student => {
                  const studentRecords = records.filter(r => r.studentId === student.id);
                  const morning = studentRecords.filter(r => r.session.toLowerCase() === "morning");
                  const afternoon = studentRecords.filter(r => r.session.toLowerCase() === "afternoon");
                  const present = studentRecords.filter(r => r.present).length;
                  const absent = studentRecords.length - present;

                  return (
                    <div className="card" key={student.id}>
                      <strong>{student.firstName} {student.lastName}</strong>
                      <p className="muted">{student.admissionId || "No admission ID"}</p>
                      <p>{student.gender || "Gender not recorded"}</p>
                      <p>{present} present records · {absent} absent records</p>
                      <p>
                        Morning: {morning.filter(r => r.present).length} present,
                        {" "}{morning.filter(r => !r.present).length} absent
                      </p>
                      <p>
                        Afternoon: {afternoon.filter(r => r.present).length} present,
                        {" "}{afternoon.filter(r => !r.present).length} absent
                      </p>
                      {studentRecords.length === 0 && <p className="muted">Not marked for this period</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}