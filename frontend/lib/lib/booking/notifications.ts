import { formatDate, formatTime } from "./config";
import { recordNotification } from "./db";

const EMAIL_PROVIDER = "resend";
const WHATSAPP_PROVIDER = "meta_cloud_api";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeWhatsAppNumber(value: unknown) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

function buildRoleLines(booking: any) {
  return (booking.roles || []).map((role: any) => {
    const details = [
      `${role.quantity} × ${role.staffRole}`,
      formatDate(role.workDate),
      `${formatTime(role.reportingTime)} report`,
      `${role.shiftDuration}h shift`,
      role.genderPreference,
      role.uniformRequirement,
    ];
    if (role.specialInstructions) details.push(role.specialInstructions);
    return `- ${details.join(" · ")}`;
  });
}

function buildClientText(booking: any, trackingUrl: string) {
  return [
    `Hi ${booking.contactPerson},`,
    "",
    `We received your manpower request ${booking.id}.`,
    `Event: ${booking.eventName}`,
    `Dates: ${formatDate(booking.eventStartDate)} to ${formatDate(booking.eventEndDate)}`,
    `City: ${booking.eventCity}, ${booking.state}`,
    `Total staff requested: ${booking.totalStaff}`,
    "",
    "Staffing plan:",
    ...buildRoleLines(booking),
    "",
    `Track your request: ${trackingUrl}`,
    "",
    "Our staffing desk will review the brief and contact you shortly.",
    "CrewConnect · Hire Manpower Desk",
  ].join("\n");
}

function buildAdminText(booking: any, trackingUrl: string) {
  return [
    `NEW MANPOWER REQUEST · ${booking.id}${booking.urgent ? " · URGENT" : ""}`,
    "",
    `Client: ${booking.clientCompanyName} (${booking.companyType})`,
    `Contact: ${booking.contactPerson} · ${booking.mobileNumber} · ${booking.whatsappNumber}`,
    `Email: ${booking.emailAddress}`,
    `Event: ${booking.eventName} (${booking.eventType})`,
    `Dates: ${formatDate(booking.eventStartDate)} to ${formatDate(booking.eventEndDate)}`,
    `Venue: ${booking.venueAddress}, ${booking.eventCity}, ${booking.state}`,
    `Guests: ${booking.guestCount} · Budget/person/shift: ₹${booking.budgetPerPerson}`,
    `Duty: ${formatTime(booking.dutyStartTime)} to ${formatTime(booking.dutyEndTime)} · Report ${formatTime(booking.reportingTime)}`,
    `Provisions: food ${booking.foodProvided}, transport ${booking.transportProvided}, accommodation ${booking.accommodationProvided}`,
    `Languages: ${(booking.languageRequirements || []).join(", ")} · Dress code: ${booking.dressCode}`,
    "",
    `Total staff: ${booking.totalStaff}`,
    ...buildRoleLines(booking),
    "",
    `Reference file: ${booking.referenceFileName || "None"}`,
    `Notes: ${booking.additionalNotes || "None"}`,
    "",
    `Open request: ${trackingUrl}`,
  ].join("\n");
}

function buildEmailHtml(booking: any, trackingUrl: string, isAdmin: boolean) {
  const roleRows = (booking.roles || [])
    .map(
      (role: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #2a2d2d;color:#f1f1ef">${escapeHtml(role.staffRole)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #2a2d2d;color:#c3c7c7">${escapeHtml(role.quantity)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #2a2d2d;color:#c3c7c7">${escapeHtml(formatDate(role.workDate))}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #2a2d2d;color:#c3c7c7">${escapeHtml(formatTime(role.reportingTime))} · ${escapeHtml(role.shiftDuration)}h</td>
        </tr>`,
    )
    .join("");

  const summaryRows: [string, string][] = [
    ["Booking ID", booking.id],
    ["Event", `${booking.eventName} (${booking.eventType})`],
    ["Event dates", `${formatDate(booking.eventStartDate)} – ${formatDate(booking.eventEndDate)}`],
    ["Venue", `${booking.venueAddress}, ${booking.eventCity}, ${booking.state}`],
    ["Client", `${booking.clientCompanyName} · ${booking.contactPerson}`],
    ["Contact", `${booking.emailAddress} · ${booking.mobileNumber}`],
    ["Total staff", String(booking.totalStaff)],
  ];

  if (isAdmin) {
    summaryRows.push(
      ["Budget / person / shift", `₹${booking.budgetPerPerson}`],
      ["Provisions", `Food: ${booking.foodProvided} · Transport: ${booking.transportProvided} · Stay: ${booking.accommodationProvided}`],
      ["Languages / dress code", `${(booking.languageRequirements || []).join(", ")} · ${booking.dressCode}`],
      ["Reference file", booking.referenceFileName || "None"],
      ["Notes", booking.additionalNotes || "None"],
    );
  }

  const rows = summaryRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#8f9494;font-size:12px;text-transform:uppercase;letter-spacing:.06em;vertical-align:top;width:34%">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#ececeb;font-size:14px;line-height:1.6">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0c0c;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c0c;padding:28px 14px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#151717;border:1px solid #2a2d2d">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #2a2d2d">
                <div style="color:#f47721;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">CrewConnect · Hire Manpower</div>
                <h1 style="margin:10px 0 0;color:#f4f3f0;font-size:26px;line-height:1.25">${isAdmin ? "New booking request" : "We received your request"}</h1>
                <p style="margin:8px 0 0;color:#a6abab;font-size:14px;line-height:1.6">${isAdmin ? "A new staffing brief is ready for review." : `Hi ${escapeHtml(booking.contactPerson)}, our desk is reviewing your staffing brief.`}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 6px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 6px">
                <div style="color:#8f9494;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px">Staffing plan</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2d2d;margin-top:8px">
                  <tr>
                    <th align="left" style="padding:10px 12px;color:#8f9494;font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2a2d2d">Role</th>
                    <th align="left" style="padding:10px 12px;color:#8f9494;font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2a2d2d">Qty</th>
                    <th align="left" style="padding:10px 12px;color:#8f9494;font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2a2d2d">Date</th>
                    <th align="left" style="padding:10px 12px;color:#8f9494;font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2a2d2d">Report / shift</th>
                  </tr>
                  ${roleRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px">
                <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:#f47721;color:#0b0c0c;text-decoration:none;font-weight:700;font-size:13px;padding:13px 20px">Track this request →</a>
                <p style="margin:16px 0 0;color:#7f8484;font-size:12px;line-height:1.6">Keep your booking ID handy: <strong style="color:#c9cdcd">${escapeHtml(booking.id)}</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail({ to, subject, text, html }: any) {
  if (!to) {
    return { status: "skipped", provider: EMAIL_PROVIDER, error: "No recipient configured." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.info(`[booking-email:logged] To: ${to} · Subject: ${subject}\n${text}`);
    return {
      status: "logged",
      provider: "console",
      error: "RESEND_API_KEY / EMAIL_FROM not configured.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        status: "failed",
        provider: EMAIL_PROVIDER,
        error: `Email provider responded ${response.status}: ${detail.slice(0, 500)}`,
      };
    }

    return { status: "sent", provider: EMAIL_PROVIDER, error: "" };
  } catch (error: any) {
    return {
      status: "failed",
      provider: EMAIL_PROVIDER,
      error: error?.message || "Email request failed.",
    };
  }
}

async function sendWhatsApp({ to, text }: any) {
  const recipient = normalizeWhatsAppNumber(to);

  if (!recipient) {
    return { status: "skipped", provider: WHATSAPP_PROVIDER, error: "No recipient configured." };
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.info(`[booking-whatsapp:logged] To: ${recipient}\n${text}`);
    return {
      status: "logged",
      provider: "console",
      error: "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured.",
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: { preview_url: false, body: text },
        }),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      return {
        status: "failed",
        provider: WHATSAPP_PROVIDER,
        error: `WhatsApp provider responded ${response.status}: ${detail.slice(0, 500)}`,
      };
    }

    return { status: "sent", provider: WHATSAPP_PROVIDER, error: "" };
  } catch (error: any) {
    return {
      status: "failed",
      provider: WHATSAPP_PROVIDER,
      error: error?.message || "WhatsApp request failed.",
    };
  }
}

function createSummary() {
  return { attempted: 0, sent: 0, failed: 0, logged: 0, skipped: 0 };
}

function tally(summary: any, status: string) {
  summary.attempted += 1;
  if (Object.hasOwn(summary, status)) summary[status] += 1;
}

export async function sendBookingNotifications({ booking, trackingUrl }: any) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;

  const clientText = buildClientText(booking, trackingUrl);
  const adminText = buildAdminText(booking, trackingUrl);
  const clientSubject = `CrewConnect booking ${booking.id} received`;
  const adminSubject = `New manpower request ${booking.id} · ${booking.eventName}`;

  const jobs = [
    {
      channel: "email",
      recipientType: "client",
      recipient: booking.emailAddress,
      subject: clientSubject,
      send: () =>
        sendEmail({
          to: booking.emailAddress,
          subject: clientSubject,
          text: clientText,
          html: buildEmailHtml(booking, trackingUrl, false),
        }),
    },
    {
      channel: "email",
      recipientType: "admin",
      recipient: adminEmail,
      subject: adminSubject,
      send: () =>
        sendEmail({
          to: adminEmail,
          subject: adminSubject,
          text: adminText,
          html: buildEmailHtml(booking, trackingUrl, true),
        }),
    },
    {
      channel: "whatsapp",
      recipientType: "client",
      recipient: booking.whatsappNumber,
      subject: clientSubject,
      send: () => sendWhatsApp({ to: booking.whatsappNumber, text: clientText }),
    },
    {
      channel: "whatsapp",
      recipientType: "admin",
      recipient: adminWhatsApp,
      subject: adminSubject,
      send: () => sendWhatsApp({ to: adminWhatsApp, text: adminText }),
    },
  ] as const;

  const summary = {
    email: createSummary(),
    whatsapp: createSummary(),
    configured: {
      email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    },
  };

  await Promise.all(
    jobs.map(async (job) => {
      let result: any;
      try {
        result = await job.send();
      } catch (error: any) {
        result = {
          status: "failed",
          provider: "unknown",
          error: error?.message || "Notification failed.",
        };
      }

      tally((summary as any)[job.channel], result.status);

      try {
        await recordNotification({
          bookingId: booking.id,
          channel: job.channel,
          recipientType: job.recipientType,
          recipient: job.recipient,
          status: result.status,
          provider: result.provider,
          subject: job.subject,
          error: result.error,
        });
      } catch (error) {
        console.error("[booking-notification] Could not record notification", error);
      }
    }),
  );

  return summary;
}
