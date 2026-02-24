const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const DEFAULT_PREFS = {
  alertChannels: ["email"],
  reportChannels: ["email"],
  alertSeverity: "warning",
  reportFrequency: "daily",
  contacts: { email: null, whatsapp: null, call: null },
  quietHours: { enabled: false, start: "22:00", end: "07:00" },
};

const MOCK_RULES = [
  { id: "r1", name: "Temperatura alta", metric: "air_temperature", condition: "above", threshold: 40, severity: "critical", enabled: true },
  { id: "r2", name: "Humedad baja", metric: "relative_humidity", condition: "below", threshold: 65, severity: "warning", enabled: true },
  { id: "r3", name: "Suelo seco", metric: "soil_humidity", condition: "below", threshold: 30, severity: "critical", enabled: true },
];

const MOCK_HISTORY = [
  { id: "a1", severity: "warning", title: "Humedad baja en Sector Aguacate Norte", description: "Humedad: 62%. Rango óptimo: 70-80%.", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "a2", severity: "critical", title: "Suelo seco en Sector Maíz A", description: "Humedad del suelo: 25%. Se requiere riego.", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

async function tryFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export const notificationApi = {
  async getPreferences(userId = "default") {
    const live = await tryFetch(`${API_URL}/notifications/preferences?userId=${userId}`);
    return live || { ...DEFAULT_PREFS };
  },

  async savePreferences(prefs) {
    const live = await tryFetch(`${API_URL}/notifications/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    return live || prefs;
  },

  async testNotification(channel, recipient, message) {
    const live = await tryFetch(`${API_URL}/notifications/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, recipient, message }),
    });
    return live || { status: "simulated", provider: `${channel}-mock` };
  },

  async getAlertRules() {
    const live = await tryFetch(`${API_URL}/notifications/alerts/rules`);
    return live || MOCK_RULES;
  },

  async addAlertRule(rule) {
    const live = await tryFetch(`${API_URL}/notifications/alerts/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    return live || { ...rule, id: `r-${Date.now()}` };
  },

  async deleteAlertRule(ruleId) {
    const live = await tryFetch(`${API_URL}/notifications/alerts/rules/${ruleId}`, { method: "DELETE" });
    return live || { deleted: true };
  },

  async getAlertHistory(limit = 50) {
    const live = await tryFetch(`${API_URL}/notifications/alerts/history?limit=${limit}`);
    return live || MOCK_HISTORY;
  },

  async getDeliveryLog(limit = 50) {
    const live = await tryFetch(`${API_URL}/notifications/log?limit=${limit}`);
    return live || [];
  },
};
