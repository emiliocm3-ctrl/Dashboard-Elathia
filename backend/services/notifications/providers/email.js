/**
 * Email Notification Provider
 *
 * Stub implementation — logs to console.
 * Replace with a real provider when ready:
 *
 *   - Resend:      npm install resend       → resend.emails.send(...)
 *   - SendGrid:    npm install @sendgrid/mail
 *   - AWS SES:     npm install @aws-sdk/client-ses
 *   - Nodemailer:  npm install nodemailer   → for SMTP
 *
 * Config needed (add to backend/config.js):
 *   email: {
 *     provider: "resend",       // or "sendgrid", "ses", "smtp"
 *     apiKey: process.env.EMAIL_API_KEY,
 *     from: "alertas@elathia.com",
 *   }
 */

async function send(recipient, payload) {
  console.log(`[EMAIL STUB] To: ${recipient}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  Body: ${payload.body}`);
  if (payload.action) console.log(`  Action: ${payload.action}`);

  // Simulate latency
  await new Promise((r) => setTimeout(r, 100));

  return {
    provider: "email-stub",
    messageId: `email-${Date.now()}`,
    delivered: true,
  };
}

module.exports = { send };
