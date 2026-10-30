// ARENA USA — minimal email sender
// Uses SMTP (via nodemailer) in production, console.log in dev.
// All emails are HTML + plain text multipart.

let nodemailerInstance: any = null;

async function getMailer(): Promise<any | null> {
  if (nodemailerInstance) return nodemailerInstance;
  // Only load nodemailer on the server, in Node runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return null;
  if (!process.env.SMTP_HOST) return null;
  try {
    const nodemailer = await import("nodemailer");
    nodemailerInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    return nodemailerInstance;
  } catch {
    return null;
  }
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; previewUrl?: string; error?: string }> {
  // In dev mode (or with DEBUG_EMAIL=true), log email body to console.
  // SECURITY: gate on a separate flag so a misconfigured production deploy
  // (where NODE_ENV != "production") doesn't leak password-reset tokens into logs.
  const shouldLog = process.env.DEBUG_EMAIL === "true" || (
    process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST
  );
  if (shouldLog) {
    console.log("\n=== EMAIL (dev mode) ===");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("---");
    console.log(payload.text);
    console.log("=========================\n");
    return { ok: true, previewUrl: "(dev mode — see server logs)" };
  }

  const mailer = await getMailer();
  if (!mailer) {
    return { ok: false, error: "SMTP not configured" };
  }

  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM ?? "ARENA USA <noreply@arena-usa.com>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { ok: true, previewUrl: info.messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "smtp error" };
  }
}

// ────────────────────────────────────────────────────────────
//  Email templates
// ────────────────────────────────────────────────────────────

export function passwordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
  expiresInHours: number;
}): EmailPayload {
  const { to, name, resetUrl, expiresInHours } = opts;
  const subject = "Reset your ARENA USA admin password";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #1c1410; color: #f5efe8; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #e8a85a, #c98a4b); border-radius: 8px; color: #1c1410; font-weight: 800; font-size: 18px;">ARENA USA</div>
      </div>
      <h1 style="font-size: 22px; color: #f5efe8; margin: 0 0 16px;">Reset your password</h1>
      <p style="color: #b8a890; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #b8a890; line-height: 1.6;">We received a request to reset the password for your ARENA USA admin account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e8a85a, #c98a4b); color: #1c1410; font-weight: 600; text-decoration: none; border-radius: 6px;">Reset password</a>
      </div>
      <p style="color: #b8a890; line-height: 1.6;">This link expires in <strong>${expiresInHours} hours</strong>.</p>
      <p style="color: #8a6234; font-size: 13px; line-height: 1.6; margin-top: 24px; padding-top: 24px; border-top: 1px solid #3a2a1f;">
        If you didn't request this password reset, you can safely ignore this email — your password will not be changed.<br><br>
        Link not working? Copy and paste this URL: <br>
        <a href="${resetUrl}" style="color: #e8a85a; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  `;
  const text = `ARENA USA — Reset your password\n\nHi ${name},\n\nWe received a request to reset your ARENA USA admin password.\n\nReset it here (link expires in ${expiresInHours} hours):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n`;
  return { to, subject, html, text };
}
