# Available Jobs (`/available-jobs`)

`/available-jobs` is the public shift board. It lists **approved, open staffing
opportunities** with just the details crew need to decide whether to apply:
event type, role, city, event date, duty hours, confirmed payment range (when
available), number of openings and the experience requirement.

Registered staff apply with their **Staff Registration ID** plus the **WhatsApp
number on that registration**, and can track every application status from the
same page.

## Privacy model

Listings live in their own `job_listings` table — they are **not** booking
requests. Client identity, venue, contact details, budgets and internal
references stay in the booking tables and are never joined into a public
response.

- `toPublicListing()` in `lib/jobs/db.js` is an explicit allow-list. Only these
  fields are returned publicly: `id`, `eventType`, `jobRole`, `city`,
  `eventDate`, `endDate`, `dutyStartTime`, `dutyEndTime`, `dutyHours`,
  `paymentMin`, `paymentMax`, `openings`, `experienceRequired`, `summary`,
  `publishedAt`.
- `booking_ref` and `requirement_ref` are stored for internal reconciliation but
  are only returned by admin endpoints.
- Public routes never accept or return a client name, venue, contact number or
  internal booking ID.
- The optional listing `summary` is public. Keep it role-focused — never paste
  client names, venue addresses or internal notes into it.

## Data model

Same SQLite file as bookings and staff (`data/crewconnect.db`, override with
`BOOKING_DATABASE_PATH`).

| Table | Purpose |
| --- | --- |
| `job_listings` | One row per public shift. Status: `draft`, `open`, `closed`, `filled`. |
| `job_applications` | One row per `(listing, registration)`. Unique pair prevents double applications. |
| `job_application_events` | Append-only status timeline for each application. |

Application statuses: `submitted`, `shortlisted`, `selected`, `not_selected`,
`withdrawn`.

When the number of `selected` applications reaches `openings`, the listing is
automatically moved from `open` to `filled`, so it disappears from the public
board.

## Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/jobs` | Open listings with filters |
| `POST` | `/api/jobs/apply` | Apply with registration ID + WhatsApp number |
| `POST` | `/api/jobs/applications` | Track applications for an identity |

`GET /api/jobs` query parameters (all optional):

- `city` — exact city name
- `role` — exact role name
- `date` — one of `any`, `7`, `30`, `90` (day windows)
- `dateFrom` / `dateTo` — explicit ISO dates, e.g. `2026-12-01`
- `payment` — one of `any`, `upto-1200`, `1200-1800`, `1800-2500`, `2500-plus`
- `experience` — `fresher` or `experienced`

The response includes `jobs`, `total` and the `filters` option lists used by the
UI (cities/roles currently on the board plus the fixed date, payment and
experience options).

```powershell
curl.exe "http://localhost:3000/api/jobs?city=Ahmedabad&payment=1800-2500"
```

```powershell
curl.exe -X POST "http://localhost:3000/api/jobs/apply" `
  -H "Content-Type: application/json" `
  -d "{\"jobId\":\"CC-JOB-2611-A1B2\",\"registrationId\":\"CC-STF-202611-A1B2C3\",\"mobileNumber\":\"9825000000\"}"
```

Identity mismatches return a generic `401` — the API never reveals whether the
registration ID or the phone number was wrong. Apply/track routes are
rate-limited per IP and per registration ID.

## Admin endpoints

All require `x-admin-key: <ADMIN_API_KEY>` (or `Authorization: Bearer ...`) and
return `503` when `ADMIN_API_KEY` is not configured.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/jobs` | List every listing with application/selected counts |
| `POST` | `/api/admin/jobs` | Create a listing (defaults to `draft`) |
| `GET` | `/api/admin/jobs/:jobId` | Single listing |
| `PATCH` | `/api/admin/jobs/:jobId` | Update fields, publish (`status: "open"`) or close |
| `GET` | `/api/admin/jobs/:jobId/applications` | Applications plus applicant summary |
| `PATCH` | `/api/admin/applications/:applicationId` | Update application status + note |

```powershell
curl.exe -X POST "http://localhost:3000/api/admin/jobs" `
  -H "Content-Type: application/json" `
  -H "x-admin-key: your-secret" `
  -d "{\"eventType\":\"Wedding\",\"jobRole\":\"Steward\",\"city\":\"Ahmedabad\",\"eventDate\":\"2026-12-12\",\"dutyStartTime\":\"16:00\",\"dutyEndTime\":\"23:00\",\"paymentMin\":1400,\"paymentMax\":1800,\"openings\":10,\"experienceRequired\":\"Any\",\"status\":\"open\"}"
```

Publish a listing by creating it with `status: "open"`, or by patching an
existing draft to `status: "open"`.

## Local demo data

For local testing only. Demo rows are tagged `booking_ref = 'DEMO-SEED'` and
never ship to production.

```powershell
node scripts/seed-job-listings.mjs          # add 8 demo listings
node scripts/seed-job-listings.mjs --clear  # remove all demo listings
```

The seed script refuses to run when `NODE_ENV=production` unless
`ALLOW_DEMO_SEED=1` is set explicitly.

## Data handling

- Only registrations that exist and are not `rejected` can apply or track.
- Applications store the registration ID, not a copy of the staff profile.
- Admin responses may include booking references for reconciliation; public and
  tracker responses do not.
- The page renders only allow-listed listing fields and never calls booking
  endpoints.
