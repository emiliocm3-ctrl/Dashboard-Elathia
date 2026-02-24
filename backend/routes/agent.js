const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();
const agentService = require("../services/agent");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

/**
 * POST /api/agent/analyze/sector/:sectorId
 * Body: { sectorData, history? }
 * Returns: { insights: Insight[] }
 */
router.post(
  "/analyze/sector/:sectorId",
  param("sectorId").notEmpty(),
  validate,
  async (req, res) => {
    try {
      const { sectorData, history } = req.body;
      const insights = await agentService.analyzeSector(sectorData, history || []);
      res.json({ sectorId: req.params.sectorId, insights });
    } catch (err) {
      console.error("Agent analyze sector error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  }
);

/**
 * POST /api/agent/analyze/ranch/:ranchId
 * Body: { ranchData }
 * Returns: { health, sectorCount, criticalCount, warningCount, insights, recommendations }
 */
router.post(
  "/analyze/ranch/:ranchId",
  param("ranchId").notEmpty(),
  validate,
  async (req, res) => {
    try {
      const result = await agentService.analyzeRanch(req.body.ranchData);
      res.json({ ranchId: req.params.ranchId, ...result });
    } catch (err) {
      console.error("Agent analyze ranch error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  }
);

/**
 * POST /api/agent/anomalies
 * Body: { readings, windowHours? }
 * Returns: { anomalies: Anomaly[] }
 */
router.post("/anomalies", async (req, res) => {
  try {
    const { readings, windowHours } = req.body;
    const anomalies = await agentService.detectAnomalies(readings, windowHours || 24);
    res.json({ anomalies });
  } catch (err) {
    console.error("Agent anomaly detection error:", err);
    res.status(500).json({ error: "Anomaly detection failed" });
  }
});

/**
 * POST /api/agent/chat
 * Body: { prompt, context? }
 * Returns: { response, model, timestamp }
 */
router.post(
  "/chat",
  body("prompt").isString().notEmpty().withMessage("prompt is required"),
  validate,
  async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const result = await agentService.chat(prompt, context || {});
      res.json(result);
    } catch (err) {
      console.error("Agent chat error:", err);
      res.status(500).json({ error: "Chat failed" });
    }
  }
);

module.exports = router;
