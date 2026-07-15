import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email using the Resend REST API.
 * Gracefully stubs execution in development/test modes when API keys are absent.
 */
export async function sendEmail({ to, subject, html }: SendEmailPayload): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM_ADDRESS;

  const isTestOrStub =
    env.NODE_ENV === "test" ||
    !apiKey ||
    apiKey === "your-resend-api-key-here" ||
    apiKey === "";

  if (isTestOrStub) {
    logger.info(`📧 [EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(5000), // 5-second network timeout
    });

    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`Failed to send email to ${to} (status: ${res.status})`, new Error(errorText));
      return false;
    }

    logger.info(`Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    logger.error(`Exception during email dispatch to ${to}`, err);
    return false;
  }
}

/**
 * Dispatches an email verification link.
 */
export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const subject = "Verify your email address - LLM-SHEILD";
  const html = `
    <h1>Verify your email</h1>
    <p>Thank you for signing up for LLM-SHEILD. Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}" target="_blank">Verify Email</a>
    <p>If you did not sign up for this account, please ignore this email.</p>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * Dispatches a password reset link.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset your password - LLM-SHEILD";
  const html = `
    <h1>Reset your password</h1>
    <p>You requested a password reset. Please click the link below to set a new password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>This link is valid for a limited time. If you did not make this request, please ignore this email.</p>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * Dispatches a general account security event.
 */
export async function sendAccountEventEmail(to: string, eventName: string, details: string) {
  const subject = `Account Notification: ${eventName} - LLM-SHEILD`;
  const html = `
    <h1>Security/Account Notification</h1>
    <p>An event occurred on your account: <strong>${eventName}</strong></p>
    <p>${details}</p>
    <p>If this was not you, please secure your account immediately.</p>
  `;
  return sendEmail({ to, subject, html });
}
