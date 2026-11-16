# Hire Manpower booking requests

The `/hire-manpower` page is a 5-step manpower booking wizard. It stores every
request and its staffing roles in SQLite, validates again on the server, and can
notify the admin and client through Resend (email) and the WhatsApp Cloud API.

## How it works

- **Client:** `app/hire-manpower/HireManpowerClient.tsx` (currently `HireManpowerClient.jsx` pending TS migration) handles the wizard, live
  staff totals, review/edit flow and success screen.
- **Validation:** `lib/booking/validation.js` is shared by the browser and the
  API. The server never trusts client validation.
- **Database:** `lib/booking/db.js` creates `data/crewconnect.db` on first use
  using the built-in `node:sqlite` module. Tables:
  `booking_requests`, `staffing_requirements`, `booking_status_events` and
  `booking_notifications`.
- **API:** `POST /api/bookings` (multipart `payload` + optional
  `referenceFile`) validates, generates a booking ID like
  `CC-MP-202611-A1B2C3`, saves the request, and dispatches notifications.
- **Tracking:** `/hire-manpower/track` accepts a booking ID + email, or a secure
  `?ref=...&token=...` link. `GET /api/bookings/track` and
  `POST /api/bookings/track` back the page.
- **Status updates:** `PATCH /api/bookings/:bookingId/status` with an
  `x-admin-key` header (or `Authorization: Bearer ...`) matching `ADMIN_API_KEY`.

## Setup

1. Copy `.env.example` to `.env.local` and fill in what you use.
2. Run `npm run dev`.
3. Submit a test request, then look up its booking ID under
   `/hire-manpower/track`.

Without notification credentials the app still saves requests and records
notification attempts with status `logged` (the message is written to the server
console). Add the provider keys to start sending.

### Email (Resend)

Set `RESEND_API_KEY` and `EMAIL_FROM`. The sender domain must be verified in
Resend. The client receives a confirmation; `ADMIN_EMAIL` receives the full
brief.

### WhatsApp (Meta Cloud API)

Set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and (optionally)
`ADMIN_WHATSAPP_NUMBER`. The integration sends free-form text messages. Meta's
24-hour customer-service window applies; for messages outside that window you
will need an approved template.

### Admin status updates

```powershell
curl.exe -X PATCH "http://localhost:3000/api/bookings/CC-MP-202611-A1B2C3/status" `
  -H "Content-Type: application/json" `
  -H "x-admin-key: your-secret" `
  -d "{\"status\":\"under_review\",\"note\":\"Checking Ahmedabad crew availability.\"}"
```

Valid statuses: `received`, `under_review`, `staffing`, `confirmed`,
`completed`, `cancelled`.

## Uploads

Reference files are optional, limited to 5 MB, and stored as a BLOB in SQLite.
Only PDF, DOC, DOCX, JPG, PNG and WEBP are accepted. The file is never exposed
through the public tracking endpoint.
