import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} params.html - HTML email content
 * @param {string} [params.from] - Sender email address (defaults to noreply@yourdomain.com)
 * @returns {Promise<Object>} - Result object with success status
 */
export async function sendEmail({ to, subject, html, from = 'noreply@yourdomain.com' }) {
  try {
    console.log('[EMAIL] Sending to:', to);
    console.log('[EMAIL] Subject:', subject);

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, and html');
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const result = await resend.emails.send({
      from: from,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('[EMAIL] Sent successfully:', result.id);

    return {
      success: true,
      emailId: result.id,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('[EMAIL] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
