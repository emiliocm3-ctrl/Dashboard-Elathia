/**
 * Rule-Based Analyzer (default stub)
 *
 * Implements the agent interface using deterministic rules.
 * Replace or extend with ML models / LLM calls for production.
 */

const THRESHOLDS = {
  temperature: { min: 20, max: 40, unit: "°C" },
  humidity: { min: 70, max: 80, unit: "%" },
  soilMoisture: { min: 35, max: 75, unit: "%" },
  conductivity: { min: 1, max: 3, unit: "mS/cm" },
};

function evaluateMetric(name, value, thresholds) {
  if (value == null || isNaN(value)) return null;
  const { min, max } = thresholds;
  const buffer = (max - min) * 0.2;
  if (value >= min && value <= max) return { metric: name, status: "ok", value };
  if (value >= min - buffer && value <= max + buffer) return { metric: name, status: "warning", value };
  return { metric: name, status: "critical", value };
}

function buildInsight(severity, title, description, action) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    severity,
    title,
    description,
    action,
    timestamp: new Date().toISOString(),
  };
}

function analyzeSector(sectorData, history = []) {
  const insights = [];
  if (!sectorData) return insights;

  const temp = evaluateMetric("temperature", sectorData.air_temperature, THRESHOLDS.temperature);
  const hum = evaluateMetric("humidity", sectorData.relative_humidity, THRESHOLDS.humidity);
  const soil = evaluateMetric("soilMoisture", sectorData.soil_humidity, THRESHOLDS.soilMoisture);
  const cond = evaluateMetric("conductivity", sectorData.soil_conductivity, THRESHOLDS.conductivity);

  if (temp?.status === "critical") {
    const high = temp.value > THRESHOLDS.temperature.max;
    insights.push(buildInsight(
      "critical",
      high ? "Temperatura muy alta" : "Temperatura muy baja",
      `La temperatura actual es ${temp.value}°C (rango óptimo: ${THRESHOLDS.temperature.min}-${THRESHOLDS.temperature.max}°C).`,
      high ? "Revise ventilación y considere riego por aspersión para enfriar." : "Proteja cultivos con coberturas o mantas térmicas."
    ));
  } else if (temp?.status === "warning") {
    insights.push(buildInsight("warning", "Temperatura fuera del rango óptimo", `Temperatura actual: ${temp.value}°C.`, "Monitoree de cerca las próximas horas."));
  }

  if (hum?.status === "critical") {
    const high = hum.value > THRESHOLDS.humidity.max;
    insights.push(buildInsight(
      "critical",
      high ? "Humedad excesiva" : "Humedad muy baja",
      `Humedad relativa: ${hum.value}% (óptimo: ${THRESHOLDS.humidity.min}-${THRESHOLDS.humidity.max}%).`,
      high ? "Riesgo de enfermedades fúngicas. Mejore ventilación." : "Considere riego para aumentar la humedad."
    ));
  }

  if (soil?.status === "critical" && soil.value < THRESHOLDS.soilMoisture.min) {
    insights.push(buildInsight("critical", "Suelo muy seco", `Humedad del suelo: ${soil.value}%.`, "Se requiere riego urgente."));
  } else if (soil?.status === "warning" && soil.value < THRESHOLDS.soilMoisture.min) {
    insights.push(buildInsight("warning", "Suelo perdiendo humedad", `Humedad del suelo: ${soil.value}%.`, "Planifique riego en las próximas horas."));
  }

  if (cond?.status !== "ok" && cond) {
    insights.push(buildInsight(cond.status, "Conductividad fuera de rango", `Conductividad: ${cond.value} mS/cm.`, "Revise la salinidad del suelo y ajuste la fertilización."));
  }

  if (insights.length === 0) {
    insights.push(buildInsight("ok", "Todo en orden", "Todas las métricas están dentro del rango óptimo.", null));
  }

  return insights;
}

function analyzeRanch(ranchData) {
  if (!ranchData || !ranchData.sectors) {
    return { health: "unknown", insights: [], recommendations: [] };
  }

  const allInsights = ranchData.sectors.flatMap((s) => analyzeSector(s));
  const criticalCount = allInsights.filter((i) => i.severity === "critical").length;
  const warningCount = allInsights.filter((i) => i.severity === "warning").length;

  const health = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "ok";

  const recommendations = [];
  if (criticalCount > 0) recommendations.push("Hay sectores con métricas críticas que requieren atención inmediata.");
  if (warningCount > 0) recommendations.push("Algunos sectores muestran métricas fuera del rango óptimo. Revise pronto.");
  if (health === "ok") recommendations.push("Todos los sectores están en buen estado. Mantenga el monitoreo habitual.");

  return {
    health,
    sectorCount: ranchData.sectors.length,
    criticalCount,
    warningCount,
    insights: allInsights.filter((i) => i.severity !== "ok"),
    recommendations,
  };
}

function detectAnomalies(readings, windowHours = 24) {
  const anomalies = [];
  if (!Array.isArray(readings) || readings.length < 3) return anomalies;

  const cutoff = Date.now() - windowHours * 3600 * 1000;
  const recent = readings.filter((r) => new Date(r.timestamp_converted || r.timestamp).getTime() > cutoff);
  if (recent.length < 3) return anomalies;

  ["air_temperature", "relative_humidity", "soil_humidity"].forEach((key) => {
    const values = recent.map((r) => r[key]).filter((v) => v != null && !isNaN(v));
    if (values.length < 3) return;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);

    if (std === 0) return;
    const latest = values[values.length - 1];
    const zScore = Math.abs((latest - mean) / std);

    if (zScore > 2.5) {
      anomalies.push({
        metric: key,
        value: latest,
        mean: +mean.toFixed(2),
        stdDev: +std.toFixed(2),
        zScore: +zScore.toFixed(2),
        severity: zScore > 3.5 ? "critical" : "warning",
        message: `${key} value ${latest} is ${zScore.toFixed(1)} standard deviations from the mean (${mean.toFixed(1)}).`,
      });
    }
  });

  return anomalies;
}

function chat(prompt, context = {}) {
  const sectorHint = context.sectorId ? ` para el sector ${context.sectorId}` : "";
  return {
    response: `Análisis basado en reglas${sectorHint}: "${prompt}" — Esta es una respuesta stub. Conecte un LLM (OpenAI, Anthropic, etc.) para respuestas inteligentes.`,
    model: "rule-based-v1",
    timestamp: new Date().toISOString(),
  };
}

module.exports = { analyzeSector, analyzeRanch, detectAnomalies, chat };
