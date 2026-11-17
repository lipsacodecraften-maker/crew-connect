const GRAPH_VERSION = "v21.0";

export function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppOtp(phone: string, code: string) {
  const recipient = String(phone || "").replace(/\D/g, "");
  const text = [
    `CrewConnect verification code: ${code}`,
    "",
    "This code expires in 10 minutes. Do not share it with anyone.",
    "If you did not request this code, ignore this message.",
  ].join("\n");

  if (!isWhatsAppConfigured()) {
    console.info(
      `[staff-otp:logged] WhatsApp OTP for ${recipient}: ${code} (provider not configured)`,
    );
    return { delivered: false, configured: false, provider: "console" };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
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
      console.error(
        `[staff-otp] WhatsApp provider responded ${response.status}: ${detail.slice(0, 500)}`,
      );
      return {
        delivered: false,
        configured: true,
        provider: "meta_cloud_api",
        error: "WhatsApp delivery failed.",
      };
    }

    return {
      delivered: true,
      configured: true,
      provider: "meta_cloud_api",
    };
  } catch (error) {
    console.error("[staff-otp] WhatsApp send failed", error);
    return {
      delivered: false,
      configured: true,
      provider: "meta_cloud_api",
      error: "WhatsApp delivery failed.",
    };
  }
}
