# Favour School Management System — Roadmap

**Repository:** `greenbasket-labs/favour`  
**Working branch:** `feature/school-owned-identities`  
**Product target:** a simple, single-school operating system for Favour Int'l School  
**Status:** active development; implementation and pilot readiness must be verified, not assumed.

This roadmap is the working decision record. It replaces inherited SkulGo multi-school product assumptions where they conflict with the agreed Favour single-school installation.

## 1. Product rules

1. Solve a real school problem before adding a feature.
2. Inspect the current implementation before editing; do not rebuild a working flow unnecessarily.
3. Keep the user-facing system single-school: no school registration, workspace selection, school switching, or tenant branding in this installation.
4. Preserve schoolId scoping and role-based authorization in APIs and data access. Single-school deployment does not justify weakening access controls.
5. Use one shared identity-and-PIN approach for supported school identities; do not require Gmail/email for school users.
6. Prefer connected records over duplicated data. Save once; authorized users see the same underlying record.
7. Important corrections and authority changes retain an audit trail.
8. Work in small, testable steps. Update documentation and report the actual verification result after each step.

## 2. Agreed product behavior

### Roles and authority
- **Proprietor/Owner:** highest authority; school-wide visibility, appoints/removes leadership, controls developer support access, and can authorize replacement devices.
- **Principal:** school-wide day-to-day leadership; can manage school operations and change fees. Use the school's real title in the UI, not a generic “Administrator” label.
- **Optional section head:** appointed by the Proprietor and limited to that section; not required in every school.
- **Teacher:** assigned class master, subject teacher, or both; access only to authorized duties and records.
- **Cashier:** records payments and views relevant balances/history.
- **Parent:** sees records for approved linked children; one parent may link multiple children.
- **Student:** sees their own permitted records and published results.
- **Applications remains in the Admin/Principal menu** for admissions, staff applications, and parent-child linking.

### Identity and device access
- Authorized leadership creates/approves an identity and issues a temporary PIN; the user activates a permanent PIN.
- School users should not need Gmail/email to log in.
- Proprietor and Principal may have up to three authorized devices each. Other identities default to one; replacement devices require Principal or Proprietor authorization.
- Audit activation, device authorization/revocation, access changes, and important corrections.
- When staff leave, disable access but preserve their identity, history, and attribution.
- Developer support access must be explicitly authorized by the Proprietor, not hidden or unrestricted.

### Student records and progression
- Student identity is per section, not per class. Moving within a section preserves the identity and historical class records; new-class calculations start with that class/session.
- Moving to a new section requires a new section identity while retaining prior history.
- Promotion, completion, and demotion rules must be verified against the agreed school calendar before automation is treated as complete.

### Student attendance
- Class master uses student checkboxes: ticked = present; unticked when saved = absent.
- Calculate total, present, absent, male, and female counts from the class records.
- Provide daily records and useful weekly/monthly/termly/yearly summaries.
- This scope is **student attendance, not staff attendance**.
- Keep records scoped by school, class, date/session, and role. Saved data should be promptly visible to authorized leadership.

### Assessments and results
- Subject teacher enters CA columns and exam marks for assigned class/subject.
- Total CA maximum must not exceed 40; CA maximum plus exam maximum must not exceed 100.
- Calculate totals and grades from the school's configured grading bands.
- Track subject-level completion and outstanding subjects. Principal/Proprietor can resolve gaps with correct actor attribution and audit history.
- Final aggregate, position, and report card require all required subjects to be complete.
- Saved marks can be corrected by authorized users without erasing the old/new values, actor, timestamp, and optional reason.

### Fees and payments
- Proprietor and Principal can create/change fees for the intended school/section/class scope.
- Support cashier-recorded payments, bank-transfer verification, and optional verified online payments according to the school's configuration.
- Do not mark an online payment successful based only on a user's claim; verify with the payment provider.
- Keep balances, payment history, and fee changes traceable.

## 3. Current verified checkpoint — October 14, 2026

### Repository alignment
- Local `HEAD` and `origin/feature/school-owned-identities` were both `fd8007e3a27caae32933b4c4c367c3c71fce701a`; `git rev-list --left-right --count HEAD...origin/feature/school-owned-identities` returned `0 0`.
- This means the saved commits matched at that checkpoint—not that the local working tree matched GitHub.
- Local working tree had **17 modified tracked files and 10 untracked files**. A tracked diff backup was created at `C:\Users\DTL\favour-local-changes.patch`; the ten untracked files were copied to `C:\Users\DTL\favour-untracked-backup\`.
- Database backups under `prisma\` are intentionally preserved and locally excluded from Git. Do not delete or overwrite them.
- The GitHub documentation updates must be brought back to the local branch through a reviewed, safe fast-forward; do not overwrite the other local changes.

### Authentication/device issue
- Local TypeScript typecheck passed after a narrow repair to the local SQLite `DeviceSession` table.
- Actual SQLite schema had `DeviceSession.userId` NOT NULL although Prisma declares it nullable. A narrow local repair made the field nullable and checked row preservation, indexes, foreign keys, and database integrity.
- Teacher activation saved a permanent PIN but subsequent login returned “Invalid Teacher ID or teacher account unavailable.”
- The inspected teacher record was active and approved but had `schoolId = null`; the local teacher login rejects a missing school association.
- GitHub's `people` and `requests` teacher-creation routes create a school membership but omit `schoolId` on the separate Teacher record. The Prisma Teacher model allows null, while assignment routes validate active school membership. This is a mismatch across identity creation and login.
- Do **not** bypass the login school check or remove school-membership/role checks to make the error disappear. Determine the intended identity-school relationship and correct creation plus safe handling of existing records.
- Local login/activation changes and diagnostic/repair scripts are not all committed to GitHub. Review before staging, committing, or pushing.

## 4. Execution order

### Phase 0 — Safe repository/documentation alignment
**Status: IN PROGRESS**

- [x] Confirm repository: `greenbasket-labs/favour`.
- [x] Confirm working branch: `feature/school-owned-identities`.
- [x] Confirm saved local commit and remote-tracking commit matched.
- [x] Back up tracked local changes and copy untracked files separately.
- [x] Update README and roadmap to reflect the Favour single-school scope.
- [ ] Review the documentation commits and safely fast-forward local tracking branch without disturbing the 17 modified files or untracked work.
- [ ] Compare local and GitHub copies of the key files; classify each local change as keep, revise, commit, or discard only after review.

**Exit gate:** no lost local work; documentation versions are aligned; remaining diffs are understood.

### Phase 1 — Identity, login, and device-session reliability
**Priority: NOW**

- [ ] Trace the full lifecycle: create person → create school membership → assign duty → issue temporary PIN → activate permanent PIN → register device → log in → authorize API access.
- [ ] Resolve the missing `Teacher.schoolId` association consistently across the people route, request-approval route, and existing teacher records.
- [ ] Decide whether `schoolId` is required for this single-school installation or whether membership is the authoritative relationship; implement one consistent rule without weakening access checks.
- [ ] Review existing teacher records before any repair; never apply a blanket update to unrelated identities or schools.
- [ ] Verify `DeviceSession` Prisma/schema/database agreement and all identity-owner foreign keys/indexes. Keep the existing backups untouched.
- [ ] Verify PIN validation, failed-attempt lockout, permanent-PIN activation, session cookies, device trust, device limits, revocation, and account deactivation.
- [ ] Test successful login, wrong PIN, inactive/unapproved identity, missing school membership, untrusted device, revoked device, and expired/locked account.
- [ ] Run typecheck/build and the focused login/activation flow.

**Exit gate:** a correctly approved and assigned teacher can activate and sign in on an authorized device; unauthorized identities/devices remain blocked; history and device limits behave as intended.

### Phase 2 — Authority and single-school boundaries
- [ ] Map Proprietor/Owner and Principal capabilities separately; confirm who can appoint/remove leadership and authorize developer support.
- [ ] Remove or hide user-facing multi-school registration, workspace selection, and school switching where they remain, without removing server-side school scoping safeguards.
- [ ] Keep Applications in the Principal/Admin navigation.
- [ ] Verify optional section-head scope and ensure the Principal retains school-wide oversight.
- [ ] Verify developer access is explicit, limited, and auditable.
- [ ] Verify disabled/ended staff identities retain historical records and correct attribution.

**Exit gate:** each role sees only its authorized school duties; leadership hierarchy matches the agreed rules.

### Phase 3 — Principal/Admin school setup and people
- [ ] Verify sections add without replacing saved sections.
- [ ] Verify classes and optional arms belong to the selected section.
- [ ] Verify subjects can be managed for the school/class structure.
- [ ] Verify applications/approvals for students, staff, and parent-child links.
- [ ] Verify teacher assignment and class-master assignment use the same school-scoped records.
- [ ] Verify Principal/Proprietor visibility and role restrictions.
- [ ] Check every visible navigation link and its empty, loading, error, and success states.

**Exit gate:** school leadership can set up the school, approve people, and assign duties without duplicate entry or dead links.

### Phase 4 — Student attendance
- [ ] Verify checkbox attendance behavior for the class master.
- [ ] Verify present/absent and male/female totals against the actual roster.
- [ ] Verify date/class/session history and summary filters.
- [ ] Verify no staff-attendance workflow is added under this requirement.
- [ ] Verify saved attendance is immediately visible to authorized leadership and restricted from unrelated roles.
- [ ] Test corrections and audit history.

**Exit gate:** an actual class can complete attendance accurately and leadership can review it.

### Phase 5 — Assessments, results, and report cards
- [ ] Verify CA columns append to the same student/subject assessment and enforce the CA maximum of 40.
- [ ] Enforce CA + exam maximum of 100 and calculate totals/grades from school settings.
- [ ] Verify subject completion/outstanding tracking and actual teacher attribution.
- [ ] Prevent final aggregate/position/report card from being treated as final while required subjects are outstanding.
- [ ] Verify report-card fields, attendance, remarks, grading bands, term labels, print/download, and published-result access.
- [ ] Treat payment-gated Result Unlock as incomplete until payment verification and the access boundary are tested end-to-end; do not expose SkulGo-controlled pricing as a school setting.

**Exit gate:** saved subject marks produce correct, traceable results and report cards only when the class's required results are complete.

### Phase 6 — Fees, cashier, and payments
- [ ] Verify fee scope and fee changes by Proprietor/Principal.
- [ ] Verify student lookup by ID, manual payment entry, receipt/teller metadata, balance calculation, and history.
- [ ] Verify bank transfers require authorized verification.
- [ ] Verify online payments only update after reliable provider confirmation.
- [ ] Verify payment/fee access is role-scoped and important changes are audited.

**Exit gate:** a cashier can record a payment and the correct authorized users see updated balances/history.

### Phase 7 — Parent and student access
- [ ] Verify admin-approved parent-to-child linking using the student/admission ID.
- [ ] Verify one parent can switch between multiple linked children.
- [ ] Verify student ID/PIN activation where enabled.
- [ ] Verify attendance, notices, fees/payment history, and only published/authorized results are visible to the correct person.
- [ ] Verify unlinking/access revocation does not delete historical school records.

**Exit gate:** parent/student access shows only the correct linked or personal records.

### Phase 8 — Audit, recovery, and production readiness
- [ ] Verify audit entries include actor, time, entity, prior/new values where relevant, and optional reason.
- [ ] Review APIs for authentication, role checks, school/object scoping, replay safety, and duplicate protection.
- [ ] Confirm production database choice, migrations, secrets, HTTPS/domain, startup/health checks, and environment variables.
- [ ] Create automated backups and document recovery; perform a restore test before real school data.
- [ ] Run build/typecheck and critical end-to-end smoke tests against the actual deployment.
- [ ] Record measured performance/capacity before making capacity claims.

**Exit gate:** restore has been tested, critical access boundaries pass, and the deployed commit has been verified.

### Phase 9 — Controlled Favour pilot
- [ ] Run the full workflow with authorized school users.
- [ ] Collect concrete friction, repeated-entry points, missing records, failed offline behavior, and confusing approvals.
- [ ] Fix failures before adding modules.
- [ ] Confirm staff training, data backup, support ownership, and handover boundaries.

**Exit gate:** the school can complete the agreed daily workflows reliably and understands how support access is authorized.

## 5. Working method and change control

For each small task:

1. State the exact behavior to verify or fix.
2. Inspect the relevant local and GitHub code.
3. Identify the records, API routes, roles, and data constraints involved.
4. Explain the proposed change before editing.
5. Back up data if the task touches the database.
6. Make the smallest change that preserves the agreed behavior.
7. Run focused tests, then typecheck/build when appropriate.
8. Inspect the final diff and report exactly what passed or failed.
9. Update this roadmap/README and checkpoint the result.
10. Commit/push only reviewed files after explicit agreement.

Never use a blind `reset`, `restore`, broad schema-repair script, or unreviewed pull to make the working tree look clean. Never delete the local database backups or treat uncommitted local changes as if they were already on GitHub.

## 6. Not in scope unless separately agreed

- Multi-school registration, school switching, or tenant-branded workspaces for this installation
- Staff attendance
- Payroll/salary management or full accounting
- Inventory, hostel, transport, or library systems
- Biometric attendance
- AI tutor/grading, complex chat/social features, or large analytics
- Large subscription/payment frameworks unrelated to the immediate school workflow

A real school need can change scope, but it must be explicitly discussed and recorded before implementation.
