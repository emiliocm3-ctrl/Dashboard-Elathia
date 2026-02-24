/**
 * Voice Call Notification Provider
 *
 * Stub implementation — logs to console.
 * Replace with a real provider when ready:
 *
 *   - Twilio:   npm install twilio  → client.calls.create({ url: twimlUrl, to, from })
 *   - Vonage:   npm install @vonage/server-sdk
 *   - Plivo:    npm install plivo
 *
 * Config needed (add to backend/config.js):
 *   calls: {
 *     provider: "twilio",
 *     accountSid: process.env.TWILIO_SID,
 *     authToken: process.env.TWILIO_AUTH_TOKEN,
 *     fromNumber: process.env.TWILIO_CALL_FROM,
 *     twimlBaseUrl: "https://your-domain.com/api/twiml",
 *   }
 *
 * For Twilio voice, you also need a TwiML endpoint that reads the alert aloud.
 * See: https://www.twilio.com/docs/voice/twiml/say
 */

async function send(recipient, payload) {
  const spokenText = payload.type === "alert"
    ? `Alerta ${payload.subject}. ${payload.body}`
    : `Reporte: ${payload.subject}`;

  console.log(`[CALL STUB] To: ${recipient}`);
  console.log(`  Script: ${spokenText.slice(0, 200)}`);

  await new Promise((r) => setTimeout(r, 200));

  return {
    provider: "call-stub",
    callId: `call-${Date.now()}`,
    delivered: true,
    duration: 0,
  };
}

module.exports = { send };
