# Favour School Management System

**A practical, connected school-record system for Favour Int'l School.**

This repository adapts the SkulGo codebase for a **single-school installation**. The goal is to help the proprietor and school leadership see reliable records from anywhere, while teachers and other authorized users complete their duties without duplicate data entry.

> **Working rule:** inspect the existing workflow, fix the real problem, make the smallest safe change, and verify it before moving on.

## Project scope

- This installation serves **Favour Int'l School**. It is not intended to expose school registration, workspace selection, school switching, or multi-tenant branding to its users.
- A separate school can have a separate installation/configuration later; do not build multi-school user-facing flows into this one.
- Preserve existing school-scoped data filters and role-based authorization. Single-school deployment is **not** permission to remove security checks.
- Use familiar school language. The senior school leadership role is displayed as **Principal** (or the school's actual title); **Proprietor/Owner** holds the highest authority.
- Keep the interface simple on phones and computers. Prefer existing records and workflows over duplicate systems.

## Core record flow

**People → Sections → Classes → Subjects → Assignments → Student Attendance → Assessments → Results → Fees & Payments**

A record is entered once and becomes visible to authorized users through their role-specific workspace. Corrections to important records should preserve an audit trail.

## Roles and authority

- **Proprietor/Owner:** highest authority; sees the whole school, appoints/removes leadership, controls developer access, and can authorize replacement devices.
- **Principal / school leadership:** manages day-to-day school operations and school-wide records within the assigned authority. The Principal may set/change school fees. Do not label this role “Administrator” in the user interface merely because the internal role enum uses `ADMIN`.
- **Optional section head:** only when appointed; access is limited to the assigned section. The Principal retains school-wide oversight.
- **Teacher:** works only with assigned classes, subjects, students, and duties. A teacher may be class master, subject teacher, or both.
- **Cashier:** records authorized payments and checks balances/payment history.
- **Parent:** after authorized linking to a child, sees that child's permitted attendance, published results, notices, and payment information. One parent may have multiple linked children.
- **Student:** sees their own permitted school information and published results.
- Other non-academic staff roles can be added when a real school duty requires them.

## Identity and access principles

- Prefer one shared **ID + PIN** approach for supported school identities; no Gmail/email requirement for school users.
- An authorized school leader creates/approves the identity and issues a temporary PIN. The user activates a permanent PIN.
- Proprietor and Principal may use up to three authorized devices each. Other users default to one authorized device; replacement devices require authorization by the Principal or Proprietor.
- Device authorization, revocation, access changes, and important corrections should be auditable.
- When a staff member leaves, disable access but retain their identity and historical work. Do not transfer old work in a way that falsely attributes it to a replacement.
- Developer access is not hidden or unrestricted. The Proprietor controls and authorizes technical-support access.

## Main workflows

### School structure and people
- Configure sections, classes/arms, and the subjects actually offered.
- Keep **Applications** in the Principal/Admin menu for student admissions, staff applications, and parent-child linking requests.
- Assign approved teachers to classes and subjects; keep the class-master duty distinct from subject teaching.
- Do not make optional section heads mandatory.

### Student attendance
- The class master marks students present using checkboxes; unticked students are absent when the record is saved.
- Calculate class total, present, absent, male, and female counts from saved student records.
- Provide daily records and weekly/monthly/termly/yearly summaries where supported.
- Attendance is for **students**, not staff attendance.
- Keep records scoped to class, date, school session, and authorized role. Saved records should be visible promptly to authorized leadership.

### Assessments and results
- Subject teachers enter CA columns and exam marks for their assigned subject/class.
- Combined CA maximum must not exceed 40; exam maximum and CA maximum together must not exceed 100.
- Calculate totals and grades using the school's configured grading bands.
- Save subject results independently and show which subjects are received or outstanding.
- Calculate final aggregates/positions/report cards only when required subject results are complete.
- Preserve corrections with actor, time, old/new values, and optional reason. A replacement teacher must be recorded as the actual actor.

### Fees and payments
- The Proprietor or Principal can define/change fees for the intended school, section, or class scope.
- Support the school's chosen combination of cashier-entered cash/bank-transfer payments and verified online payments.
- Do not treat a parent's claim of payment as provider confirmation. Bank transfers require cashier/authorized verification.
- Keep payment history, balances, and fee changes traceable.

## Current development status

This is an **active development project**, not a declaration of production readiness. The feature branch is `feature/school-owned-identities`.

The saved local commit and the GitHub feature-branch commit were verified as the same at `fd8007e3a27caae32933b4c4c367c3c71fce701a`. The local working tree also contains uncommitted changes and untracked files; those are not represented by that commit yet.

### Known checkpoint — October 2026

- Local TypeScript typecheck passed after a narrow repair to the local SQLite `DeviceSession` table.
- The local database had a `DeviceSession.userId` NOT NULL constraint even though the Prisma schema declares that field nullable. The local table was repaired narrowly; local database backups must be preserved.
- Teacher activation saved a permanent PIN, but login returned “Invalid Teacher ID or teacher account unavailable.”
- The inspected teacher record was active and approved but had `schoolId = null`, while the local teacher login requires a school association.
- Both teacher-creation routes inspected in GitHub create the school membership but omit `schoolId` on the separate Teacher record. The schema permits null, and assignment routes authorize through active school membership. This is an implementation inconsistency to resolve—not a reason to bypass school/role authorization.
- The activation/login changes and supporting diagnostic scripts in the local working tree have not all been committed to GitHub.

See [ROADMAP.md](ROADMAP.md) for the agreed order of work and verification gates.

## Development workflow

1. Inspect the exact local and GitHub files before changing code.
2. Check the existing data model, authorization, and affected workflows.
3. Preserve school-scoped checks and role permissions.
4. Back up relevant data before any database operation; never overwrite or delete existing backups casually.
5. Make one small, reviewable change at a time.
6. Run focused checks and the relevant end-to-end workflow.
7. Update this README/ROADMAP when status changes.
8. Review the diff before committing or pushing. Never reset, restore, overwrite, or pull over unreviewed local work.

## Technology

- Next.js and TypeScript
- Prisma ORM
- SQLite in local development; production database and migration readiness must be explicitly verified before real school data is used
- Role-scoped APIs and session/device authorization

## Explicit non-goals for the current phase

Do not add school switching/multi-tenant registration, staff attendance, payroll, full accounting, inventory, hostel/transport/library systems, biometric attendance, an AI tutor/grader, complex chat, or large analytics/billing systems without a separately agreed real-school need.

---

**Product principle:** keep school operations understandable, keep records connected, and protect the history behind every important decision.
