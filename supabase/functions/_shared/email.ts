import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { CONTACT_EMAIL } from "./contact.ts";

function siteUrl() {
  return Deno.env.get("SITE_URL") || "https://www.oceanhotspot.com";
}

function replyToAddress(): string {
  return (
    Deno.env.get("EMAIL_REPLY_TO")?.trim() ||
    Deno.env.get("GMAIL_USER")?.trim() ||
    CONTACT_EMAIL
  );
}

function gmailFromAddress(): string {
  const user = Deno.env.get("GMAIL_USER")?.trim();
  if (!user) return "Ocean Hotspot";
  return `Ocean Hotspot <${user}>`;
}

/** Domain email (Resend + DNS) delivers far better than personal Gmail SMTP. */
function preferResendForDeliverability(): boolean {
  const from = Deno.env.get("EMAIL_FROM")?.trim() ?? "";
  const hasResend = !!Deno.env.get("RESEND_API_KEY")?.trim();
  return hasResend && !!from && !/@gmail\.com$/i.test(from);
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; provider: string }
  | { ok: false; reason: string };

function normalizeAppPassword(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/\s+/g, "").trim();
}

async function sendViaResend(options: SendMailOptions): Promise<SendEmailResult | null> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) return null;

  const gmail = Deno.env.get("GMAIL_USER")?.trim();
  const from =
    Deno.env.get("EMAIL_FROM")?.trim() ||
    (gmail ? `Ocean Hotspot <${gmail}>` : "Ocean Hotspot <onboarding@resend.dev>");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      reply_to: options.replyTo || replyToAddress(),
      subject: options.subject,
      html: options.html,
      text: options.text || htmlToPlainText(options.html),
      headers: {
        "X-Entity-Ref-ID": options.subject.slice(0, 64),
      },
    }),
  });

  if (res.ok) return { ok: true, provider: "resend" };

  const body = await res.text();
  console.error("Resend error:", res.status, body);
  return {
    ok: false,
    reason: `Resend HTTP ${res.status} — verify domain/from address in Resend dashboard`,
  };
}

async function sendViaGmailSmtp(options: SendMailOptions): Promise<SendEmailResult | null> {
  const gmailUser = Deno.env.get("GMAIL_USER")?.trim();
  const gmailPassword = normalizeAppPassword(Deno.env.get("GMAIL_APP_PASSWORD"));

  if (!gmailUser || !gmailPassword) return null;

  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    const plain = options.text || htmlToPlainText(options.html);
    await client.send({
      from: gmailFromAddress(),
      to: options.to,
      replyTo: options.replyTo || gmailUser,
      subject: options.subject,
      content: plain,
      html: options.html,
    });

    await client.close();
    return { ok: true, provider: "gmail_smtp" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gmail SMTP error:", msg);
    return {
      ok: false,
      reason:
        `Gmail SMTP failed (${msg}). Use a Google App Password (not your login password), 2FA enabled, GMAIL_USER=${gmailUser}`,
    };
  }
}

async function sendViaCustomSmtp(options: SendMailOptions): Promise<SendEmailResult | null> {
  const host = Deno.env.get("SMTP_HOST")?.trim();
  const user = Deno.env.get("SMTP_USER")?.trim();
  const pass = normalizeAppPassword(Deno.env.get("SMTP_PASS"));
  const port = Number(Deno.env.get("SMTP_PORT")?.trim() || "465");

  if (!host || !user || !pass) return null;

  try {
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls: port === 465,
        auth: { username: user, password: pass },
      },
    });

    const fromAddr = Deno.env.get("EMAIL_FROM")?.trim() || user;
    await client.send({
      from: fromAddr,
      to: options.to,
      replyTo: options.replyTo || replyToAddress(),
      subject: options.subject,
      content: options.text || htmlToPlainText(options.html),
      html: options.html,
    });

    await client.close();
    return { ok: true, provider: "custom_smtp" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Custom SMTP error:", msg);
    return { ok: false, reason: `SMTP ${host} failed: ${msg}` };
  }
}

export async function sendEmailDetailed(options: SendMailOptions): Promise<SendEmailResult> {
  const attempts: (() => Promise<SendEmailResult | null>)[] = preferResendForDeliverability()
    ? [
      () => sendViaResend(options),
      () => sendViaGmailSmtp(options),
      () => sendViaCustomSmtp(options),
    ]
    : [
      () => sendViaGmailSmtp(options),
      () => sendViaResend(options),
      () => sendViaCustomSmtp(options),
    ];

  let lastReason =
    "No email provider configured. Set RESEND_API_KEY+EMAIL_FROM, or GMAIL_USER+GMAIL_APP_PASSWORD, or SMTP_* in Supabase Edge secrets.";

  for (const attempt of attempts) {
    const result = await attempt();
    if (result === null) continue;
    if (result.ok) return result;
    lastReason = result.reason;
  }

  console.warn("sendEmail failed:", lastReason, options.subject);
  return { ok: false, reason: lastReason };
}

export async function sendEmail(options: SendMailOptions): Promise<boolean> {
  const result = await sendEmailDetailed(options);
  return result.ok;
}

function formatMoney(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(amount);
}

export function orderConfirmationHtml(
  order: {
    id: string;
    order_number: string;
    buyer_name: string;
    total_amount: number;
    subtotal?: number;
    vat_amount?: number;
    currency: string;
    created_at?: string;
  },
  items: Array<{ product_title: string; quantity: number; total_price: number }>,
  sellerName?: string | null,
  guestToken?: string | null,
) {
  const base = siteUrl();
  const orderUrl = guestToken
    ? `${base}/orders/${order.id}?token=${encodeURIComponent(guestToken)}`
    : `${base}/orders/track`;
  const ordersUrl = `${base}/orders/track`;

  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; color: #111827;">${item.product_title}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatMoney(item.total_price, order.currency)}</td>
        </tr>`,
    )
    .join("");

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : new Date().toLocaleDateString("en-GB");

  const subtotal = order.subtotal ?? order.total_amount;
  const vat = order.vat_amount ?? 0;

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a3560;padding:28px 32px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Ocean Hotspot</p>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Order Confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;color:#047857;font-weight:bold;font-size:16px;">Payment successful</p>
              <p style="margin:8px 0 0;color:#065f46;font-size:14px;">Thank you for your order${order.buyer_name ? `, ${order.buyer_name}` : ""}!</p>
            </div>
            <p style="margin:0 0 16px;color:#374151;font-size:14px;">
              <strong>Order number:</strong> ${order.order_number}<br/>
              <strong>Order date:</strong> ${orderDate}<br/>
              ${sellerName ? `<strong>Seller:</strong> ${sellerName}<br/>` : ""}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Item</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;">Amount</th>
                </tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="3" style="padding:12px;color:#6b7280;">Your order items</td></tr>`}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
              <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Subtotal</td><td style="text-align:right;color:#111827;">${formatMoney(subtotal, order.currency)}</td></tr>
              ${vat > 0 ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">VAT</td><td style="text-align:right;color:#111827;">${formatMoney(vat, order.currency)}</td></tr>` : ""}
              <tr><td style="padding:8px 0;font-weight:bold;color:#111827;font-size:16px;">Total paid</td><td style="text-align:right;font-weight:bold;color:#1a3560;font-size:16px;">${formatMoney(order.total_amount, order.currency)}</td></tr>
            </table>
            <p style="margin:24px 0 12px;color:#374151;font-size:14px;">The seller has been notified. Use the button below to track this order — no account password needed.</p>
            <a href="${orderUrl}" style="display:inline-block;background:#FF6B14;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px;font-size:14px;">View your order</a>
            <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
              Lost this link? Look up your order with email + order number at <a href="${ordersUrl}" style="color:#1a3560;">Track order</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">Questions? Reply to this email or contact <a href="mailto:${CONTACT_EMAIL}" style="color:#1a3560;">${CONTACT_EMAIL}</a></p>
            <p style="margin:0;font-size:11px;color:#9ca3af;">Ocean Hotspot · Ocean Prime Industries Ltd · England &amp; Wales</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text twin improves inbox placement when using Gmail SMTP. */
export function orderConfirmationPlainText(
  order: {
    id: string;
    order_number: string;
    buyer_name: string;
    total_amount: number;
    subtotal?: number;
    vat_amount?: number;
    currency: string;
    created_at?: string;
  },
  items: Array<{ product_title: string; quantity: number; total_price: number }>,
  sellerName?: string | null,
  guestToken?: string | null,
): string {
  const base = siteUrl();
  const orderUrl = guestToken
    ? `${base}/orders/${order.id}?token=${encodeURIComponent(guestToken)}`
    : `${base}/orders/track`;

  const lines = items.map(
    (i) => `- ${i.product_title} x${i.quantity} — ${formatMoney(i.total_price, order.currency)}`,
  );

  return [
    `Hi${order.buyer_name ? ` ${order.buyer_name}` : ""},`,
    "",
    `Your payment for order ${order.order_number} was successful.`,
    sellerName ? `Seller: ${sellerName}` : "",
    "",
    "Items:",
    ...lines,
    "",
    `Total paid: ${formatMoney(order.total_amount, order.currency)}`,
    "",
    `View your order: ${orderUrl}`,
    "",
    `Support: ${CONTACT_EMAIL}`,
    "",
    "Ocean Hotspot · Ocean Prime Industries Ltd",
  ].filter(Boolean).join("\n");
}

export function orderReceiptHtml(
  order: {
    order_number: string;
    buyer_name: string;
    total_amount: number;
    currency: string;
    created_at?: string;
  },
  items: Array<{ product_title: string; quantity: number; unit_price: number; total_price: number }>,
) {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product_title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatMoney(item.total_price, order.currency)}</td>
        </tr>`,
    )
    .join("");

  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">Receipt — ${order.order_number}</h2>
      <p>Hi ${order.buyer_name || "there"},</p>
      <p>Receipt for order <strong>${order.order_number}</strong> (${date}).</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead><tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left;">Item</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align: right;"><strong>Total paid:</strong> ${formatMoney(order.total_amount, order.currency)}</p>
    </div>`;
}

export function dispatchNotificationHtml(order: {
  id?: string;
  order_number: string;
  buyer_name: string;
  tracking_number?: string | null;
}) {
  const orderLink = order.id
    ? `${siteUrl()}/orders/${order.id}`
    : `${siteUrl()}/my-orders`;
  const trackingBlock = order.tracking_number
    ? `<p><strong>Tracking number:</strong> ${order.tracking_number}</p>`
    : `<p>The seller will share tracking details if applicable.</p>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">Your order has shipped</h2>
      <p>Hi ${order.buyer_name || "there"},</p>
      <p>Order <strong>${order.order_number}</strong> is on its way.</p>
      ${trackingBlock}
      <p style="margin-top: 24px;"><a href="${orderLink}" style="color: #0f4c81;">Track your order</a></p>
    </div>`;
}

export function deliveryNotificationHtml(order: {
  id?: string;
  order_number: string;
  buyer_name: string;
}) {
  const orderLink = order.id
    ? `${siteUrl()}/orders/${order.id}`
    : `${siteUrl()}/my-orders`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">Your order was delivered</h2>
      <p>Hi ${order.buyer_name || "there"},</p>
      <p>Order <strong>${order.order_number}</strong> has been marked as delivered.</p>
      <p><a href="${orderLink}" style="color: #0f4c81;">Confirm receipt</a></p>
    </div>`;
}

export function sellerNewOrderHtml(order: {
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  total_amount: number;
  currency: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">New order received</h2>
      <p><strong>Order:</strong> ${order.order_number}<br/>
      <strong>Buyer:</strong> ${order.buyer_name || "Guest"} (${order.buyer_email})<br/>
      <strong>Total:</strong> ${formatMoney(order.total_amount, order.currency)}</p>
      <p><a href="${siteUrl()}/seller/orders" style="color: #0f4c81;">Manage orders</a></p>
    </div>`;
}

export function bankOrderPlacedHtml(order: {
  order_number: string;
  buyer_name: string;
  total_amount: number;
  currency: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">Order received — bank transfer pending</h2>
      <p>Hi ${order.buyer_name || "there"},</p>
      <p>Order <strong>${order.order_number}</strong> — payment pending bank transfer.</p>
      <p><strong>Total:</strong> ${formatMoney(order.total_amount, order.currency)}</p>
      <p><a href="${siteUrl()}/my-orders" style="color: #0f4c81;">View order status</a></p>
    </div>`;
}

export function enquiryNotificationHtml(data: {
  productTitle?: string;
  buyerName: string;
  buyerEmail: string;
  message: string;
  dashboardUrl?: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">New product enquiry</h2>
      ${data.productTitle ? `<p><strong>Product:</strong> ${data.productTitle}</p>` : ""}
      <p><strong>From:</strong> ${data.buyerName} (${data.buyerEmail})</p>
      <p style="background: #f9fafb; padding: 12px; border-radius: 8px;">${data.message.replace(/\n/g, "<br/>")}</p>
      ${data.dashboardUrl ? `<p><a href="${data.dashboardUrl}" style="color: #0f4c81;">View enquiries</a></p>` : ""}
    </div>`;
}

export function gdprRequestNotificationHtml(data: {
  request_type: string;
  email: string;
  full_name?: string;
  message?: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f4c81;">GDPR ${data.request_type} request</h2>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.message ? `<p>${data.message.replace(/\n/g, "<br/>")}</p>` : ""}
    </div>`;
}
