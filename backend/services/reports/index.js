/**
 * Report Scheduler
 *
 * Generates periodic summary reports and dispatches them via the notification
 * service. In production, use node-cron or a job queue (Bull, BullMQ, Agenda)
 * for reliable scheduling. This stub provides the report generation logic and
 * a simple setInterval-based scheduler.
 *
 * Report types:
 *   - daily:   Sent at 07:00, covers last 24h
 *   - weekly:  Sent Monday 07:00, covers last 7d
 *   - monthly: Sent 1st of month, covers last 30d
 *
 * Integration:
 *   npm install node-cron  (when ready for production scheduling)
 *   const cron = require('node-cron');
 *   cron.schedule('0 7 * * *', () => generateAndSend('daily'));
 */

const notificationService = require("../notifications");

const schedules = new Map();
let schedulerInterval = null;

function generateDailyReport(ranchesData) {
  const totalSectors = ranchesData.reduce((n, r) => n + (r.sectors?.length || 0), 0);
  const allSectors = ranchesData.flatMap((r) => r.sectors || []);

  const temps = allSectors.map((s) => s.air_temperature).filter((v) => v != null);
  const hums = allSectors.map((s) => s.relative_humidity).filter((v) => v != null);

  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "--";
  const avgHum = hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : "--";

  const criticalSectors = allSectors.filter((s) =>
    s.air_temperature > 40 || s.air_temperature < 18 ||
    s.soil_humidity < 30 || s.relative_humidity < 60
  );

  return {
    title: `Reporte Diario — ${new Date().toLocaleDateString("es-ES")}`,
    period: "daily",
    summary: `${ranchesData.length} ranchos, ${totalSectors} sectores monitoreados. Temp promedio: ${avgTemp}°C, Humedad promedio: ${avgHum}%.${criticalSectors.length > 0 ? ` ${criticalSectors.length} sector(es) con métricas críticas.` : " Todo en orden."}`,
    sections: [
      {
        heading: "Resumen General",
        items: [
          `Ranchos: ${ranchesData.length}`,
          `Sectores: ${totalSectors}`,
          `Temperatura promedio: ${avgTemp}°C`,
          `Humedad promedio: ${avgHum}%`,
        ],
      },
      ...(criticalSectors.length > 0
        ? [{
            heading: "Sectores que requieren atención",
            items: criticalSectors.map((s) => `${s.name}: T=${s.air_temperature}°C, H=${s.relative_humidity}%, Suelo=${s.soil_humidity}%`),
          }]
        : []),
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateWeeklyReport(ranchesData, alertHistory = []) {
  const daily = generateDailyReport(ranchesData);
  const weekAlerts = alertHistory.filter((a) => {
    const ts = new Date(a.timestamp).getTime();
    return ts > Date.now() - 7 * 24 * 3600 * 1000;
  });

  return {
    ...daily,
    title: `Reporte Semanal — Semana del ${new Date().toLocaleDateString("es-ES")}`,
    period: "weekly",
    sections: [
      ...daily.sections,
      {
        heading: "Alertas de la semana",
        items: weekAlerts.length > 0
          ? weekAlerts.slice(0, 20).map((a) => `[${a.severity}] ${a.title}`)
          : ["Sin alertas esta semana"],
      },
    ],
  };
}

async function sendReport(userId, report) {
  return notificationService.sendReport(userId, report);
}

function scheduleUser(userId, frequency, dataFetcher) {
  schedules.set(userId, { frequency, dataFetcher, lastSent: null });
}

function unscheduleUser(userId) {
  schedules.delete(userId);
}

function getSchedules() {
  return Array.from(schedules.entries()).map(([userId, config]) => ({
    userId,
    frequency: config.frequency,
    lastSent: config.lastSent,
  }));
}

/**
 * Tick function — call on interval (or via cron).
 * Checks if any scheduled reports should fire.
 */
async function tick() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun
  const dayOfMonth = now.getDate();

  for (const [userId, config] of schedules) {
    const { frequency, dataFetcher, lastSent } = config;
    if (lastSent && Date.now() - new Date(lastSent).getTime() < 23 * 3600 * 1000) continue;

    let shouldSend = false;
    if (frequency === "daily" && hour === 7) shouldSend = true;
    if (frequency === "weekly" && dayOfWeek === 1 && hour === 7) shouldSend = true;
    if (frequency === "monthly" && dayOfMonth === 1 && hour === 7) shouldSend = true;

    if (!shouldSend) continue;

    try {
      const data = typeof dataFetcher === "function" ? await dataFetcher() : [];
      const report = frequency === "weekly"
        ? generateWeeklyReport(data)
        : generateDailyReport(data);
      await sendReport(userId, report);
      config.lastSent = now.toISOString();
    } catch (err) {
      console.error(`Report send failed for user ${userId}:`, err);
    }
  }
}

function startScheduler(intervalMs = 60 * 60 * 1000) {
  if (schedulerInterval) return;
  schedulerInterval = setInterval(tick, intervalMs);
  console.log(`[Reports] Scheduler started (checking every ${intervalMs / 1000}s)`);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  sendReport,
  scheduleUser,
  unscheduleUser,
  getSchedules,
  tick,
  startScheduler,
  stopScheduler,
};
