const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

/**
 * Mock agent responses for when backend is unavailable.
 * Mirrors the rule-based analyzer output format.
 */
function mockAnalyzeSector(sectorData) {
  const insights = [];
  if (!sectorData) return insights;

  if (sectorData.air_temperature > 38) {
    insights.push({ id: "m1", severity: "warning", title: "Temperatura elevada", description: `${sectorData.air_temperature}°C — cerca del límite superior.`, action: "Monitoree de cerca.", timestamp: new Date().toISOString() });
  }
  if (sectorData.relative_humidity < 65) {
    insights.push({ id: "m2", severity: "warning", title: "Humedad baja", description: `${sectorData.relative_humidity}% — por debajo del óptimo.`, action: "Considere regar.", timestamp: new Date().toISOString() });
  }
  if (sectorData.soil_humidity < 35) {
    insights.push({ id: "m3", severity: "critical", title: "Suelo seco", description: `Humedad del suelo: ${sectorData.soil_humidity}%.`, action: "Riego urgente.", timestamp: new Date().toISOString() });
  }
  if (insights.length === 0) {
    insights.push({ id: "m0", severity: "ok", title: "Todo en orden", description: "Las métricas están dentro del rango óptimo.", action: null, timestamp: new Date().toISOString() });
  }
  return insights;
}

function mockChat(prompt) {
  return {
    response: `Respuesta de prueba para: "${prompt}". Conecte un modelo de IA para respuestas inteligentes.`,
    model: "mock-v1",
    timestamp: new Date().toISOString(),
  };
}

async function tryFetch(url, options) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export const agentApi = {
  async analyzeSector(sectorId, sectorData, history = []) {
    const live = await tryFetch(`${API_URL}/agent/analyze/sector/${sectorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectorData, history }),
    });
    if (live) return live.insights;
    return mockAnalyzeSector(sectorData);
  },

  async analyzeRanch(ranchId, ranchData) {
    const live = await tryFetch(`${API_URL}/agent/analyze/ranch/${ranchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranchData }),
    });
    if (live) return live;
    return { health: "ok", insights: [], recommendations: ["Análisis no disponible — usando datos locales."] };
  },

  async detectAnomalies(readings, windowHours = 24) {
    const live = await tryFetch(`${API_URL}/agent/anomalies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readings, windowHours }),
    });
    if (live) return live.anomalies;
    return [];
  },

  async chat(prompt, context = {}) {
    const live = await tryFetch(`${API_URL}/agent/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    });
    if (live) return live;
    return mockChat(prompt);
  },
};
