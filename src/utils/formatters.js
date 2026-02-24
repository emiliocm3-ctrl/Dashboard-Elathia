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

/**
 * Evaluates a metric value against its optimal range defined in METRICS config.
 * Returns { status, statusText } where status is "ok", "warning", or "critical".
 *
 * Ranges are parsed from the "min-max" format in METRICS[metricType].optimalRange.
 * A 20% buffer around the range boundaries triggers "warning"; beyond that is "critical".
 */
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
