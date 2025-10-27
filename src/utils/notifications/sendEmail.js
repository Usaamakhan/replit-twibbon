import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { validateMailersendKey } from "../validateEnv";

// Lazy validation - only validate when actually sending emails, not during build
let mailerSend = null;
let isValidated = false;

function getMailerSendInstance() {
  if (!mailerSend) {
    // Only validate at runtime when actually sending emails
    if (!isValidated) {
      validateMailersendKey(process.env.MAILERSEND_API_KEY);
      isValidated = true;
    }
    mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || "",
    });
  }
  return mailerSend;
}

/**
 * Send an email using MailerSend API
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} params.html - HTML email content
 * @param {string} [params.from] - Sender email address (defaults to MailerSend trial domain)
 * @returns {Promise<Object>} - Result object with success status
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = "noreply@test-nrw7gymxx6jg2k8e.mlsender.net", // MailerSend trial domain
}) {
  try {
    console.log("[EMAIL] Sending to:", to);
    console.log("[EMAIL] Subject:", subject);

    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, and html");
    }

    if (!process.env.MAILERSEND_API_KEY) {
      throw new Error("MAILERSEND_API_KEY environment variable is not set");
    }

    const sentFrom = new Sender(from, "Twibbonize");
    const recipients = [new Recipient(to, to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    const mailer = getMailerSendInstance();
    const result = await mailer.email.send(emailParams);

    console.log("[EMAIL] Sent successfully:", result.body?.messageId || "sent");

    return {
      success: true,
      emailId: result.body?.messageId || "sent",
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("[EMAIL] Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
