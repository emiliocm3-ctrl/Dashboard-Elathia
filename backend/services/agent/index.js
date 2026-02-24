/**
 * Agent Analysis Service
 *
 * Provides a pluggable interface for AI/ML-powered analysis of sensor data.
 * The default implementation uses rule-based heuristics. Swap `analyzer` for
 * an OpenAI / Anthropic / custom ML adapter when ready.
 *
 * Integration points:
 *   - analyzeSector(sectorData, history)  -> insights[]
 *   - analyzeRanch(ranchData)             -> summary + recommendations
 *   - detectAnomalies(readings, window)   -> anomalies[]
 *   - chat(prompt, context)               -> string  (conversational agent)
 */

const analyzer = require("./ruleAnalyzer");

async function analyzeSector(sectorData, history = []) {
  return analyzer.analyzeSector(sectorData, history);
}

async function analyzeRanch(ranchData) {
  return analyzer.analyzeRanch(ranchData);
}

async function detectAnomalies(readings, windowHours = 24) {
  return analyzer.detectAnomalies(readings, windowHours);
}

/**
 * Conversational agent endpoint. In the stub this returns a canned response.
 * Replace with an LLM call (OpenAI, Anthropic, etc.) when integrating.
 *
 * Expected context shape:
 *   { sectorId?, ranchId?, tenantId?, recentReadings? }
 */
async function chat(prompt, context = {}) {
  return analyzer.chat(prompt, context);
}

module.exports = { analyzeSector, analyzeRanch, detectAnomalies, chat };
