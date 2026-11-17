# Staff registration (`/join-as-staff`)

`/join-as-staff` is a 5-step staff registration workflow. It verifies the applicant's
WhatsApp number with an OTP, validates the full profile on the client and again
on the server, encrypts photo/document uploads, and stores the application with a
unique Staff Registration ID and a default status of **Pending Review**.

## Steps

1. **Personal** — full name, mobile number + WhatsApp OTP, email, date of birth
   (18+ enforced), current city, area/pincode, languages, profile photo.
2. **Skills** — event boy/girl, wedding hospitality, groom/bride side assistant,
   bouncer, security, exhibition promoter, registration staff, ticket scanner,
   technician, event supervisor, serving staff, event helper, other.
3. **Experience** — fresher/experienced, years of experience, previous events,
   expected per-shift payment, optional resume.
4. **Availability** — preferred cities, available from/until dates, day/night
   shift, full-day/part-time, willing to travel, transport availability.
5. **Verification** — photo, up to 3 optional supporting documents, document
   storage consent, age declaration, privacy policy and terms acceptance.

## How it works

- **Client:** `app/join-as-staff/StaffRegistrationWizard.tsx` (currently `StaffRegistrationWizard.jsx` pending TS migration) handles the wizard,
  OTP UI, uploads, review/edit flow and success screen.
- **Config/data:** `lib/staff/config.js` holds the options, initial form,
  status metadata, age/phone helpers and file limits.
- **Validation:** `lib/staff/validation.js` is shared by the browser and API.
  The server never trusts client validation.
- **Database:** `lib/staff/db.js` creates the staff tables in the same SQLite
  file as bookings (`data/crewconnect.db`) using `node:sqlite`. Tables:
  `staff_registrations`, `staff_documents`, `staff_status_events` and
  `staff_otp_challenges`.
- **Encryption:** `lib/staff/secureStorage.js` encrypts uploads with
  AES-256-GCM before they reach SQLite.
- **Submission:** `POST /api/staff-registrations` accepts multipart form data
  (`payload` + `profilePhoto`, optional `resume` and `supportingDocuments`),
  verifies the OTP token, encrypts uploads, and generates an ID like
  `CC-STF-202611-A1B2C3`.
- **OTP:** `POST /api/staff/otp/send` and `POST /api/staff/otp/verify`. Codes
  are hashed, expire after 10 minutes, allow 5 attempts, are rate-limited to one
  send per 30 seconds and five sends per hour, and yield a single-use 30-minute
  verification token that is consumed on successful submission.

## Setup

1. Copy `.env.example` to `.env.local` and fill in what you use.
2. Run `npm run dev`.
3. Open `/join-as-staff`, complete the profile, and submit.

Without WhatsApp credentials the OTP endpoint returns a local `devCode` in
non-production so the flow can be tested. In production, missing credentials
return HTTP 503 instead of leaking a code.

### WhatsApp OTP (Meta Cloud API)

Reuses `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`. The integration
sends free-form text messages. Meta's 24-hour customer-service window applies;
for messages outside that window use an approved template.

### Encryption keys

`STAFF_DOCUMENT_ENCRYPTION_KEY` protects profile photos and documents. It accepts
a 64-character hex string, a base64-encoded 32-byte key, or a passphrase (hashed
with SHA-256). When unset, a key is generated at `data/staff-documents.key` on
first use. Always set an explicit key in production so backups stay decryptable,
and keep it out of source control.

`OTP_HASH_SECRET` salts OTP code hashes and falls back to the document key.

## Admin endpoints

All require `x-admin-key: <ADMIN_API_KEY>` (or `Authorization: Bearer ...`).
They return 503 when `ADMIN_API_KEY` is not configured.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/staff-registrations/:registrationId` | Full profile, document metadata and status history |
| `PATCH` | `/api/staff-registrations/:registrationId/status` | Update status with an optional note |
| `GET` | `/api/staff-registrations/:registrationId/photo` | Decrypted profile photo |
| `GET` | `/api/staff-registrations/:registrationId/documents/:documentId` | Decrypted supporting document / resume |

Valid statuses: `pending_review`, `under_verification`, `approved`, `rejected`,
`on_hold`.

```powershell
curl.exe -X PATCH "http://localhost:3000/api/staff-registrations/CC-STF-202611-A1B2C3/status" `
  -H "Content-Type: application/json" `
  -H "x-admin-key: your-secret" `
  -d "{\"status\":\"under_verification\",\"note\":\"Checking experience certificate.\"}"
```

## Data handling

- Profile photo is required; resume and supporting documents are optional.
- Documents are capped at 3 files, 5 MB each, and only requested when
  verification needs them. Aadhaar/ID numbers should not be collected unless
  specifically required and consented to.
- Supporting documents require explicit storage consent in the UI.
- Uploads are never exposed through a public endpoint; they can only be read via
  the admin routes above, which decrypt in memory and return `no-store`.
- Age is calculated from date of birth and enforced server-side at 18+.
