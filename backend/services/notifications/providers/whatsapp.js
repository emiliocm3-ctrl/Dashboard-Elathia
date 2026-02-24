/**
 * WhatsApp Notification Provider
 *
 * Stub implementation — logs to console.
 * Replace with a real provider when ready:
 *
 *   - Twilio:   npm install twilio  → client.messages.create({ from: 'whatsapp:+14155238886', to, body })
 *   - Meta Business API: direct HTTP calls to graph.facebook.com
 *   - MessageBird: npm install messagebird
 *
 * Config needed (add to backend/config.js):
 *   whatsapp: {
 *     provider: "twilio",
 *     accountSid: process.env.TWILIO_SID,
 *     authToken: process.env.TWILIO_AUTH_TOKEN,
 *     fromNumber: process.env.TWILIO_WHATSAPP_FROM,  // "whatsapp:+14155238886"
 *   }
 */

async function send(recipient, payload) {
  const message = payload.type === "alert"
    ? `⚠️ *${payload.subject}*\n${payload.body}${payload.action ? `\n\n📋 ${payload.action}` : ""}`
    : `📊 *${payload.subject}*\n${payload.body}`;

  console.log(`[WHATSAPP STUB] To: ${recipient}`);
  console.log(`  Message: ${message.slice(0, 200)}`);

  await new Promise((r) => setTimeout(r, 100));

  return {
    provider: "whatsapp-stub",
    messageId: `wa-${Date.now()}`,
    delivered: true,
  };
}

module.exports = { send };
