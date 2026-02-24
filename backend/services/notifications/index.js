/**
 * Notification Service
 *
 * Dispatches notifications through pluggable providers (email, whatsapp, calls).
 * Manages user notification preferences and delivery history.
 *
 * Integration:
 *   1. Configure providers in config.js (API keys, from-addresses, etc.)
 *   2. Register user preferences via the /api/notifications/preferences endpoint
 *   3. The alert engine (../alerts) triggers notifications automatically
 *   4. The report scheduler (../reports) sends periodic digests
 */

const emailProvider = require("./providers/email");
const whatsappProvider = require("./providers/whatsapp");
const callProvider = require("./providers/call");

const providers = {
  email: emailProvider,
  whatsapp: whatsappProvider,
  call: callProvider,
};

// In-memory store for stub; replace with database table in production
const preferences = new Map();
const deliveryLog = [];

async function send(channel, recipient, payload) {
  const provider = providers[channel];
  if (!provider) throw new Error(`Unknown notification channel: ${channel}`);

  const result = await provider.send(recipient, payload);
  deliveryLog.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    channel,
    recipient,
    payload,
    result,
    timestamp: new Date().toISOString(),
  });
  return result;
}

async function sendAlert(userId, alert) {
  const prefs = preferences.get(userId) || getDefaultPreferences();
  const results = [];

  for (const channel of prefs.alertChannels) {
    const contact = prefs.contacts[channel];
    if (!contact) continue;
    try {
      const result = await send(channel, contact, {
        type: "alert",
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        body: alert.description,
        action: alert.action,
        sectorName: alert.sectorName,
        ranchName: alert.ranchName,
      });
      results.push({ channel, status: "sent", ...result });
    } catch (err) {
      results.push({ channel, status: "failed", error: err.message });
    }
  }
  return results;
}

async function sendReport(userId, report) {
  const prefs = preferences.get(userId) || getDefaultPreferences();
  const results = [];

  for (const channel of prefs.reportChannels) {
    const contact = prefs.contacts[channel];
    if (!contact) continue;
    try {
      const result = await send(channel, contact, {
        type: "report",
        subject: report.title,
        body: report.summary,
        sections: report.sections,
        period: report.period,
      });
      results.push({ channel, status: "sent", ...result });
    } catch (err) {
      results.push({ channel, status: "failed", error: err.message });
    }
  }
  return results;
}

function getDefaultPreferences() {
  return {
    alertChannels: ["email"],
    reportChannels: ["email"],
    alertSeverity: "warning", // minimum severity: "warning" or "critical"
    reportFrequency: "daily", // "daily", "weekly", "monthly", "none"
    contacts: { email: null, whatsapp: null, call: null },
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
  };
}

function setPreferences(userId, prefs) {
  const current = preferences.get(userId) || getDefaultPreferences();
  const merged = { ...current, ...prefs };
  if (prefs.contacts) merged.contacts = { ...current.contacts, ...prefs.contacts };
  if (prefs.quietHours) merged.quietHours = { ...current.quietHours, ...prefs.quietHours };
  preferences.set(userId, merged);
  return merged;
}

function getPreferences(userId) {
  return preferences.get(userId) || getDefaultPreferences();
}

function getDeliveryLog(limit = 50) {
  return deliveryLog.slice(-limit).reverse();
}

module.exports = {
  send,
  sendAlert,
  sendReport,
  getDefaultPreferences,
  setPreferences,
  getPreferences,
  getDeliveryLog,
};
