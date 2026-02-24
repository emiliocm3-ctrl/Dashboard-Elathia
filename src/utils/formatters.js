import { METRICS } from "../config/constants";

export const formatValue = (value, decimals = 1) => {
  if (value === null || value === undefined) return "--";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "--";
  return decimals === 0 ? num.toFixed(0) : num.toFixed(decimals);
};

export const parseNumber = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : null;
};

const STATUS_TEXT = {
  ok: "¡Bien! Estado óptimo.",
  warning: "Fuera del rango óptimo.",
  critical: "¡Atención! Valor crítico.",
};

const FRIENDLY_STATUS = {
  ok: "Bueno",
  warning: "Revisar",
  critical: "Urgente",
};

export function getMetricStatus(metricType, rawValue) {
  const num = parseNumber(rawValue);
  if (num === null) return { status: "ok", statusText: STATUS_TEXT.ok };

  const metric = METRICS[metricType];
  if (!metric || !metric.optimalRange) {
    return { status: "ok", statusText: STATUS_TEXT.ok };
  }

  const [minStr, maxStr] = metric.optimalRange.split("-");
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return { status: "ok", statusText: STATUS_TEXT.ok };
  }

  if (num >= min && num <= max) {
    return { status: "ok", statusText: STATUS_TEXT.ok };
  }

  const range = max - min || 1;
  const buffer = range * 0.2;

  if (num >= min - buffer && num <= max + buffer) {
    return { status: "warning", statusText: STATUS_TEXT.warning };
  }

  return { status: "critical", statusText: STATUS_TEXT.critical };
}

export function getFriendlyStatus(status) {
  return FRIENDLY_STATUS[status] || "Bueno";
}

export function getOverallHealth(sectors) {
  if (!sectors || sectors.length === 0) return "ok";
  const statuses = sectors.map((s) => {
    const temp = getMetricStatus("temperature", s.air_temperature).status;
    const hum = getMetricStatus("humidity", s.relative_humidity).status;
    const soil = getMetricStatus("humidity", s.soil_humidity).status;
    return [temp, hum, soil];
  }).flat();
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "ok";
}

const HEALTH_SUMMARIES = {
  ok: "Todo en orden",
  warning: "Requiere atención",
  critical: "Acción urgente necesaria",
};

export function getHealthSummary(sectors) {
  if (!sectors || sectors.length === 0) return "Sin datos";
  const ok = sectors.filter((s) => {
    const t = getMetricStatus("temperature", s.air_temperature).status;
    const h = getMetricStatus("humidity", s.relative_humidity).status;
    return t === "ok" && h === "ok";
  }).length;
  const attention = sectors.length - ok;
  if (attention === 0) return HEALTH_SUMMARIES.ok;
  return `${ok} bien, ${attention} necesita${attention === 1 ? "" : "n"} atención`;
}

export function getAvgMetrics(sectors) {
  if (!sectors || sectors.length === 0) return { temp: null, hum: null };
  const temps = sectors.map((s) => parseNumber(s.air_temperature)).filter((v) => v !== null);
  const hums = sectors.map((s) => parseNumber(s.relative_humidity)).filter((v) => v !== null);
  return {
    temp: temps.length ? +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : null,
    hum: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null,
  };
}

export function getTrendDirection(value, optimalMin, optimalMax) {
  const num = parseNumber(value);
  if (num === null) return "stable";
  const mid = (optimalMin + optimalMax) / 2;
  const range = optimalMax - optimalMin;
  const diff = num - mid;
  if (Math.abs(diff) < range * 0.1) return "stable";
  return diff > 0 ? "up" : "down";
}

const ALERT_MESSAGES = {
  temperature: {
    high: "Temperatura elevada. Revise ventilación o riego.",
    low: "Temperatura baja. Proteja los cultivos.",
  },
  humidity: {
    high: "Humedad excesiva. Riesgo de hongos.",
    low: "Humedad baja. Considere regar.",
  },
  soilMoisture: {
    high: "Suelo saturado. Reduzca riego.",
    low: "Suelo seco. Necesita riego.",
  },
};

export function getAlertMessage(metricType, status, value, optimalMin, optimalMax) {
  if (status === "ok") return null;
  const num = parseNumber(value);
  if (num === null) return null;
  const mid = (optimalMin + optimalMax) / 2;
  const direction = num > mid ? "high" : "low";
  const messages = ALERT_MESSAGES[metricType];
  return messages ? messages[direction] : null;
}

export function getWaterLevel(thetaDisponible) {
  const val = parseNumber(thetaDisponible);
  if (val === null) return { level: "unknown", label: "Sin datos", percent: 0 };
  if (val >= 0.8) return { level: "full", label: "Lleno", percent: Math.min(val * 100, 100) };
  if (val >= 0.6) return { level: "good", label: "Bueno", percent: val * 100 };
  if (val >= 0.4) return { level: "low", label: "Bajo", percent: val * 100 };
  return { level: "dry", label: "Seco", percent: Math.max(val * 100, 5) };
}

export function getSectorAlerts(sector) {
  const alerts = [];
  const tempStatus = getMetricStatus("temperature", sector.air_temperature);
  if (tempStatus.status !== "ok") {
    const msg = getAlertMessage("temperature", tempStatus.status, sector.air_temperature, 20, 40);
    if (msg) alerts.push({ type: "temperature", severity: tempStatus.status, message: msg });
  }
  const humStatus = getMetricStatus("humidity", sector.relative_humidity);
  if (humStatus.status !== "ok") {
    const msg = getAlertMessage("humidity", humStatus.status, sector.relative_humidity, 70, 80);
    if (msg) alerts.push({ type: "humidity", severity: humStatus.status, message: msg });
  }
  const soilNum = parseNumber(sector.soil_humidity);
  if (soilNum !== null && (soilNum < 35 || soilNum > 75)) {
    const severity = soilNum < 25 || soilNum > 85 ? "critical" : "warning";
    const dir = soilNum > 55 ? "high" : "low";
    alerts.push({
      type: "soilMoisture",
      severity,
      message: ALERT_MESSAGES.soilMoisture[dir],
    });
  }
  return alerts;
}
