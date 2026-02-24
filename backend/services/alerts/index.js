/**
 * Alert Rules Engine
 *
 * Evaluates sensor readings against configurable threshold rules and triggers
 * notifications when conditions are met. Supports cooldown periods to prevent
 * alert fatigue.
 *
 * Usage:
 *   1. Define rules via addRule() or the /api/alerts/rules endpoint
 *   2. Call evaluate(sectorId, readings) on each data refresh
 *   3. Triggered alerts are passed to the notification service
 *
 * Integration with agent: The agent's analyzeSector() output can also be
 * fed into triggerFromInsights() to generate notifications from AI analysis.
 */

const notificationService = require("../notifications");

// In-memory store — replace with DB table for production
const rules = new Map();
const activeAlerts = new Map();
const alertHistory = [];

const DEFAULT_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

function addRule(rule) {
  const id = rule.id || `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const stored = {
    id,
    name: rule.name,
    metric: rule.metric,           // "air_temperature", "relative_humidity", "soil_humidity", etc.
    condition: rule.condition,       // "above", "below", "outside_range"
    threshold: rule.threshold,       // number or { min, max } for outside_range
    severity: rule.severity || "warning",
    cooldownMs: rule.cooldownMs || DEFAULT_COOLDOWN_MS,
    enabled: rule.enabled !== false,
    tenantId: rule.tenantId || null,
    sectorId: rule.sectorId || null,
    createdAt: new Date().toISOString(),
  };
  rules.set(id, stored);
  return stored;
}

function removeRule(ruleId) {
  return rules.delete(ruleId);
}

function getRules(filters = {}) {
  let result = Array.from(rules.values());
  if (filters.tenantId) result = result.filter((r) => !r.tenantId || r.tenantId === filters.tenantId);
  if (filters.sectorId) result = result.filter((r) => !r.sectorId || r.sectorId === filters.sectorId);
  if (filters.enabled !== undefined) result = result.filter((r) => r.enabled === filters.enabled);
  return result;
}

function checkCooldown(ruleId, sectorId) {
  const key = `${ruleId}:${sectorId}`;
  const last = activeAlerts.get(key);
  if (!last) return false;
  const rule = rules.get(ruleId);
  return Date.now() - last < (rule?.cooldownMs || DEFAULT_COOLDOWN_MS);
}

function evaluate(sectorId, reading, sectorMeta = {}) {
  const triggered = [];

  for (const rule of rules.values()) {
    if (!rule.enabled) continue;
    if (rule.sectorId && rule.sectorId !== sectorId) continue;

    const value = reading[rule.metric];
    if (value == null || isNaN(value)) continue;

    let fired = false;
    if (rule.condition === "above" && value > rule.threshold) fired = true;
    if (rule.condition === "below" && value < rule.threshold) fired = true;
    if (rule.condition === "outside_range") {
      const { min, max } = rule.threshold;
      if (value < min || value > max) fired = true;
    }

    if (!fired) continue;
    if (checkCooldown(rule.id, sectorId)) continue;

    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      sectorId,
      sectorName: sectorMeta.name || sectorId,
      ranchName: sectorMeta.ranchName || null,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      condition: rule.condition,
      severity: rule.severity,
      title: `${rule.name}: ${rule.metric} = ${value}`,
      description: `${rule.metric} is ${value} (rule: ${rule.condition} ${JSON.stringify(rule.threshold)})`,
      action: null,
      timestamp: new Date().toISOString(),
    };

    activeAlerts.set(`${rule.id}:${sectorId}`, Date.now());
    alertHistory.push(alert);
    triggered.push(alert);
  }

  return triggered;
}

async function evaluateAndNotify(userId, sectorId, reading, sectorMeta = {}) {
  const triggered = evaluate(sectorId, reading, sectorMeta);
  const results = [];

  for (const alert of triggered) {
    const notifResults = await notificationService.sendAlert(userId, alert);
    results.push({ alert, notifications: notifResults });
  }

  return results;
}

async function triggerFromInsights(userId, insights, sectorMeta = {}) {
  const results = [];
  for (const insight of insights) {
    if (insight.severity === "ok") continue;
    const alert = {
      ...insight,
      sectorName: sectorMeta.name,
      ranchName: sectorMeta.ranchName,
    };
    alertHistory.push(alert);
    const notifResults = await notificationService.sendAlert(userId, alert);
    results.push({ alert, notifications: notifResults });
  }
  return results;
}

function getAlertHistory(limit = 100) {
  return alertHistory.slice(-limit).reverse();
}

function getActiveAlerts() {
  return Array.from(activeAlerts.entries()).map(([key, ts]) => ({
    key,
    lastTriggered: new Date(ts).toISOString(),
  }));
}

// Seed some default rules
addRule({ name: "Temperatura alta", metric: "air_temperature", condition: "above", threshold: 40, severity: "critical" });
addRule({ name: "Temperatura baja", metric: "air_temperature", condition: "below", threshold: 18, severity: "warning" });
addRule({ name: "Humedad baja", metric: "relative_humidity", condition: "below", threshold: 65, severity: "warning" });
addRule({ name: "Suelo seco", metric: "soil_humidity", condition: "below", threshold: 30, severity: "critical" });
addRule({ name: "Suelo saturado", metric: "soil_humidity", condition: "above", threshold: 80, severity: "warning" });

module.exports = {
  addRule,
  removeRule,
  getRules,
  evaluate,
  evaluateAndNotify,
  triggerFromInsights,
  getAlertHistory,
  getActiveAlerts,
};
