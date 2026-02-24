const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const notificationService = require("../services/notifications");
const alertsEngine = require("../services/alerts");
const reportScheduler = require("../services/reports");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// ─── Notification Preferences ───

/**
 * GET /api/notifications/preferences
 * Query: ?userId=...
 */
router.get("/preferences", (req, res) => {
  const userId = req.query.userId || "default";
  res.json(notificationService.getPreferences(userId));
});

/**
 * PUT /api/notifications/preferences
 * Body: { userId, alertChannels?, reportChannels?, alertSeverity?, reportFrequency?, contacts?, quietHours? }
 */
router.put(
  "/preferences",
  body("userId").optional().isString(),
  validate,
  (req, res) => {
    const userId = req.body.userId || "default";
    const updated = notificationService.setPreferences(userId, req.body);
    res.json(updated);
  }
);

/**
 * GET /api/notifications/log
 * Query: ?limit=50
 */
router.get("/log", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(notificationService.getDeliveryLog(limit));
});

/**
 * POST /api/notifications/test
 * Body: { channel, recipient, message }
 * Sends a test notification through the specified channel.
 */
router.post(
  "/test",
  body("channel").isIn(["email", "whatsapp", "call"]).withMessage("Invalid channel"),
  body("recipient").isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const result = await notificationService.send(req.body.channel, req.body.recipient, {
        type: "alert",
        subject: "Notificación de prueba — Elathia",
        body: req.body.message || "Esta es una notificación de prueba del sistema de alertas.",
      });
      res.json({ status: "sent", result });
    } catch (err) {
      res.status(500).json({ status: "failed", error: err.message });
    }
  }
);

// ─── Alert Rules ───

/**
 * GET /api/notifications/alerts/rules
 */
router.get("/alerts/rules", (req, res) => {
  const filters = {};
  if (req.query.tenantId) filters.tenantId = req.query.tenantId;
  if (req.query.sectorId) filters.sectorId = req.query.sectorId;
  res.json(alertsEngine.getRules(filters));
});

/**
 * POST /api/notifications/alerts/rules
 * Body: { name, metric, condition, threshold, severity?, cooldownMs?, sectorId?, tenantId? }
 */
router.post(
  "/alerts/rules",
  body("name").isString().notEmpty(),
  body("metric").isString().notEmpty(),
  body("condition").isIn(["above", "below", "outside_range"]),
  body("threshold").notEmpty(),
  validate,
  (req, res) => {
    const rule = alertsEngine.addRule(req.body);
    res.status(201).json(rule);
  }
);

/**
 * DELETE /api/notifications/alerts/rules/:ruleId
 */
router.delete("/alerts/rules/:ruleId", (req, res) => {
  const deleted = alertsEngine.removeRule(req.params.ruleId);
  res.json({ deleted });
});

/**
 * GET /api/notifications/alerts/history
 */
router.get("/alerts/history", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(alertsEngine.getAlertHistory(limit));
});

/**
 * GET /api/notifications/alerts/active
 */
router.get("/alerts/active", (req, res) => {
  res.json(alertsEngine.getActiveAlerts());
});

// ─── Reports ───

/**
 * GET /api/notifications/reports/schedules
 */
router.get("/reports/schedules", (req, res) => {
  res.json(reportScheduler.getSchedules());
});

/**
 * POST /api/notifications/reports/generate
 * Body: { type: "daily"|"weekly", ranchesData }
 */
router.post("/reports/generate", async (req, res) => {
  try {
    const { type, ranchesData } = req.body;
    const report = type === "weekly"
      ? reportScheduler.generateWeeklyReport(ranchesData || [], alertsEngine.getAlertHistory())
      : reportScheduler.generateDailyReport(ranchesData || []);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
