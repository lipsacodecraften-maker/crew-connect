# CrewConnect Admin Dashboard

Operations desk for CrewConnect: a secure, role-based back office for client
manpower requests, staffing, quotations, candidate review, job publishing and
event allocations.

The dashboard is part of the existing Next.js App Router application. It runs on
the same PostgreSQL/Prisma database as the public booking, staff registration
and job-board flows, so the desk sees public submissions immediately.

---

## 1. Quick start

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed:admin
npm run dev
```

Open <http://localhost:3000/admin/login>.

Local demo accounts created by `npm run seed:admin`:

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `superadmin@crewconnect.local` | `CrewConnect#2026` |
| Operations manager | `manager@crewconnect.local` | `Manager#2026` |
| Coordinator | `coordinator@crewconnect.local` | `Coordinator#2026` |
| Viewer | `viewer@crewconnect.local` | `Viewer#2026` |

The seed script refuses to run when `NODE_ENV=production`. Demo credentials on
the login screen are hidden in production and when `HIDE_DEMO_ADMIN=1`.

Production commands:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run build
npm start
```

---

## 2. What the desk does

| Area | Capabilities |
| --- | --- |
| Overview | Staff registrations, pending approvals, available staff, upcoming events, manpower requests, open applications, quotations, assignment fill, shortlists, pipeline activity, recent requests/applications and an audit feed. |
| Client requests | Full event brief, requirement sheet, city/date/role/status search, booking status updates, quotations, crew assignment, printable staffing roster. |
| Staff | Candidate dossier and documents, approve/reject/request details, filter by city/availability/skill/experience, assignments and attendance, work history, review history, job applications. |
| Staff matching | Rank approved crew by role, city, date, availability, shift and experience. Shows score breakdown and conflicts, blocks duplicates and shift clashes. |
| Job management | Create draft or published listings, optionally link a booking requirement, publish/mark filled/return to draft, review and shortlist applications, select and allocate candidates. |
| Admin team | Super admins can create admin users, change roles/status and reset passwords. Everyone can change their own password and review their recent activity. |

The public site keeps its existing marketing pages, booking form, staff
registration and public job board. `SiteChrome` hides the marketing header and
footer under `/admin` so the desk has its own shell.

---

## 3. Folder structure

```
app/
  admin/
    admin.css                     Admin design system and responsive layout
    layout.tsx                    Admin-only root (no public chrome)
    login/
      page.tsx                    Server page; demo-credential gate
      LoginForm.tsx               Client sign-in form
    (dashboard)/
      layout.tsx                  Session + permission guard for all desk pages
      page.tsx                    Overview
      account/                    Own password and activity
      bookings/                   Request pipeline, detail, roster summary
      staff/                      Candidate pipeline and detail dossier
      matching/                   Matching explorer
      jobs/                       Listings, create form, detail, allocation
      team/                       Admin user management
    _components/                  AdminShell, shared UI, assignment controls
  api/admin/                      JSON endpoints for every mutation
lib/
  admin/
    constants.ts                  Roles, permissions, status catalogues
    auth.ts                       Sessions, login/logout, guards, API-key auth
    password.ts                   scrypt hashing and verification
    http.ts                       JSON helpers, origin checks, client IP
    db.ts                         Admin/audit/session Prisma queries
    overview.ts                   Dashboard metrics and feeds
    bookings.ts                   Requests, quotations, booking status
    staff.ts                      Staff lists, dossier, review, work history
    assignments.ts                Conflict checks, assignment/attendance writes
    matching.ts                   Matching context, scoring, assignment re-check
    jobs.ts                       Job listings, applications, allocation
    format.ts                     Dates, money, shift helpers, JSON arrays
  bookings/                       Public booking persistence
  staff/                          Public staff registration and documents
  jobs/                           Public job board
prisma/
  schema.prisma                   PostgreSQL models
  migrations/                     Migration history
scripts/
  seed-admin.mjs                  Local demo admin accounts
```

Server pages read through the service layer in `lib/admin/*`. Client components
only call the `/api/admin/*` routes; they never receive database credentials or
session internals.

---

## 4. Authentication

- Passwords are hashed with Node `scrypt` (`scrypt$<salt>$<hash>`) in
  `lib/admin/password.ts`; verification uses `timingSafeEqual`.
- Successful login creates a random 32-byte session token. Only its SHA-256
  hash is stored in `admin_sessions`.
- The token is sent as the HttpOnly `cc_admin_session` cookie
  (`SameSite=Lax`, `Secure` in production, 12-hour expiry). JavaScript cannot
  read it.
- Every request re-validates the session against PostgreSQL, checks that the
  admin account is still active and updates `lastSeenAt` at most every five
  minutes. Logout and password/role changes revoke sessions.
- Login is throttled per client IP: 8 failures in 15 minutes. The IP hash is
  salted with `ADMIN_IP_SALT`.
- Mutating API routes verify the request origin and write an `admin_audit_logs`
  row (actor, action, entity, metadata, IP hash, user agent).
- The legacy `ADMIN_API_KEY` / `x-admin-key` integration is still accepted and
  treated as a super-admin actor. All new admin traffic uses the session cookie.
- `/admin/login?next=...` only accepts internal admin paths; external redirects
  are discarded.

### Roles and permissions

Permissions are declared once in `lib/admin/constants.ts` and enforced in both
the sidebar and every API route.

| Permission | Super admin | Operations manager | Coordinator | Viewer |
| --- | :-: | :-: | :-: | :-: |
| `dashboard.view` | ✓ | ✓ | ✓ | ✓ |
| `bookings.view` | ✓ | ✓ | ✓ | ✓ |
| `bookings.manage` | ✓ | ✓ | ✓ | |
| `quotations.manage` | ✓ | ✓ | ✓ | |
| `staff.view` | ✓ | ✓ | ✓ | ✓ |
| `staff.review` | ✓ | ✓ | ✓ | |
| `assignments.manage` | ✓ | ✓ | ✓ | |
| `attendance.manage` | ✓ | ✓ | ✓ | |
| `matching.view` | ✓ | ✓ | ✓ | ✓ |
| `jobs.view` | ✓ | ✓ | ✓ | ✓ |
| `jobs.manage` | ✓ | ✓ | ✓ | |
| `applications.manage` | ✓ | ✓ | ✓ | |
| `team.manage` | ✓ | | | |

Guard pattern used by API routes:

```ts
const auth = await authorizeAdminRequest(request, {
  permission: "assignments.manage",
});
if (!auth.ok) return auth.response;
```

Unauthenticated page requests are redirected to `/admin/login?next=<path>`;
unauthorised pages show the access-denied state. A disabled admin account loses
access immediately on the next request.

---

## 5. Data model

Added in migration `20261116072631_admin_dashboard`:

- `AdminUser` — desk account, role, status, password hash, last login.
- `AdminSession` — hashed session token, expiry, revocation, IP/user agent.
- `AdminAuditLog` — append-only action trail.
- `Quotation` / `QuotationLineItem` — client pricing per booking.
- `EventAssignment` — staff ↔ booking requirement allocation, shift, pay,
  attendance and status.
- `StaffWorkHistory` — completed-event history, either derived from an
  assignment or entered manually.

Existing public models (`BookingRequest`, `StaffingRequirement`,
`StaffRegistration`, `JobListing`, `JobApplication`, documents and OTP
challenges) are reused rather than duplicated.

---

## 6. Main flows

### Client request → staffing

1. A client submits the public booking form.
2. The request appears under **Client requests** and in the overview.
3. The desk opens the request, reviews the event brief and requirement sheet,
   then updates the booking status (`received` → `under_review` → `staffing` →
   `confirmed` → `completed`, or `cancelled`).
4. **Match staff** ranks approved candidates. **Assign** creates an
   `EventAssignment` after re-checking conflicts server-side.
5. **Staffing summary** renders a printable roster and commercial summary.

### Candidate review

1. Public registration lands in `pending_review`.
2. Staff detail lets a reviewer move it to `under_verification`, `approved`,
   `rejected` or `on_hold` with a note.
3. Only `approved` staff are eligible for matching and assignment.
4. Assignments feed attendance and work history. Work-history entries created by
   an assignment are protected; manual entries can be added or deleted.

### Matching and conflicts

`recommendStaff` scores each approved candidate out of 105:

| Factor | Max |
| --- | --- |
| Role/skill fit (exact, partial, aliases, token overlap) | 40 |
| City (based there, preferred city, willing to travel) | 20 |
| Availability window covers the work date | 15 |
| Experience requirement | 15 |
| Shift compatibility | 10 |
| Reliability (transport, travel willingness) | 5 |

Candidates are sorted assignable-first, then by score. Conflicts include:
not approved, outside availability, duplicate assignment to the same
requirement, overlapping shift on the same day, requirement already filled,
booking closed and invalid input. The assignment API runs
`verifyCandidateAssignment` again so a stale browser tab cannot bypass a rule.

### Quotations

The booking detail page builds line items from requested roles (quantity, days,
unit rate), applies tax (18% by default), sets validity and status
(`draft`/`sent`/`accepted`/`rejected`) and stores notes. Totals recalculate in
the browser; the server recalculates and validates before saving.

### Jobs and allocation

1. Create a listing as draft, optionally linked to a booking and requirement.
2. Publish it to the public board, later mark it filled or return it to draft.
3. Applications are reviewed as new → shortlisted → selected / not selected.
4. Selecting an application on a booking-linked listing creates a confirmed
   event assignment and re-checks conflicts. Standalone listings only record the
   selection.
5. Closing/filling a listing stops new public applications.

---

## 7. API surface

All endpoints below require an admin session unless noted. Every mutation
requires the matching permission and is audit-logged.

```
POST   /api/admin/auth/login                 (public, throttled)
POST   /api/admin/auth/logout
GET    /api/admin/auth/session
POST   /api/admin/auth/password

GET    /api/admin/overview
GET    /api/admin/bookings
GET    /api/admin/bookings/[bookingId]
PATCH  /api/admin/bookings/[bookingId]/status
POST   /api/admin/bookings/[bookingId]/quotation
POST   /api/admin/bookings/[bookingId]/assignments

GET    /api/admin/staff
GET    /api/admin/staff/[registrationId]
PATCH  /api/admin/staff/[registrationId]/status
POST   /api/admin/staff/[registrationId]/work-history
DELETE /api/admin/staff/[registrationId]/work-history/[entryId]

GET    /api/admin/matching
POST   /api/admin/matching                   (recommendations)
POST   /api/admin/assignments/[assignmentId] (status, attendance, pay)

GET    /api/admin/jobs
POST   /api/admin/jobs
PATCH  /api/admin/jobs/[jobId]
GET    /api/admin/jobs/[jobId]/applications
PATCH  /api/admin/applications/[applicationId]
POST   /api/admin/applications/[applicationId]/allocate

GET    /api/admin/team
POST   /api/admin/team                      (create admin)
PATCH  /api/admin/team                      (role, status, password reset)
```

Public/legacy routes keep working: bookings, booking tracking/status, staff
registration and documents, jobs and applications, OTP verification. Staff
photo/document endpoints accept either an admin session or the legacy admin key.

---

## 8. Environment

Required:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Recommended for the dashboard:

```env
# Stable salt for hashed client IPs in sessions and audit logs
ADMIN_IP_SALT=change-me

# Hide demo credentials on the login page (also hidden in production)
HIDE_DEMO_ADMIN=1

# Legacy machine-to-machine admin key; treated as super admin
ADMIN_API_KEY=change-me
```

Other existing integrations remain unchanged: `NEXT_PUBLIC_APP_URL`,
`ADMIN_EMAIL`, `ADMIN_WHATSAPP_NUMBER`, `RESEND_API_KEY`, `EMAIL_FROM`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`STAFF_DOCUMENT_ENCRYPTION_KEY` and `OTP_HASH_SECRET`.

---

## 9. Operating notes

- **Create the first admin.** `npm run seed:admin` is intended for local/demo
  use. In production, promote a user with a one-off script or insert an
  `AdminUser` row whose `passwordHash` was produced by `hashPassword` in
  `lib/admin/password.ts`, then sign in and create the rest through **Admin
  team**.
- **Disabling an admin** revokes their sessions and blocks future logins.
  Changing a password revokes the account's other sessions.
- **Audit trail** is append-only from the app's perspective. Overview and the
  account page surface the newest entries; query `admin_audit_logs` for history.
- **Deleting a booking requirement** is blocked while active assignments exist;
  cancel or reassign them first.
- **Assignment statuses**: `proposed`, `confirmed`, `checked_in`, `completed`,
  `cancelled`, `no_show`. Cancelled/no-show crew do not count toward fill.
- **Attendance statuses**: `pending`, `checked_in`, `checked_out`, `absent`.
- **Dates** are stored as ISO date strings on existing models; the desk formats
  them with the app's locale helpers and treats all times as server-local.
- **Photos/documents** stay encrypted at rest and are streamed only to signed-in
  admins.

---

## 10. Verification performed

- `npx tsc --noEmit` completes cleanly.
- `npm run build` succeeds (Next.js production build, all admin routes dynamic).
- Browser smoke test covered: login/logout cookie flow, overview metrics, request
  pipeline and detail, roster print view, staff directory, matching
  recommendations, assignment creation, duplicate-assignment blocking, job
  creation/publishing, team page and account page.
- Test records created during the smoke test were removed afterwards.
