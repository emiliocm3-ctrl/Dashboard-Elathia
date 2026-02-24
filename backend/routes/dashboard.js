const express = require("express");
const { param, query, validationResult } = require("express-validator");
const router = express.Router();
const pool = require("../db");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const numericParam = (name) => param(name).isInt({ min: 1 }).withMessage(`${name} must be a positive integer`);
const rangeQuery = query("range").optional().isIn(["8h", "24h", "7d", "30d", "60d", "90d"]).withMessage("Invalid range value");

const ALLOWED_INTERVALS = {
  "8h": "8 hours",
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  "60d": "60 days",
  "90d": "90 days",
};

function resolveInterval(range, fallback = "60d") {
  return ALLOWED_INTERVALS[range] || ALLOWED_INTERVALS[fallback];
}

const DEVICE_SECTOR_MAP_CTE = `
  WITH device_sector_map AS (
    SELECT DISTINCT ON (device_id)
      device_id,
      cliente_id,
      rancho_id,
      sector_id
    FROM gold.v_transpiration_efficiency
    ORDER BY device_id, timestamp DESC
  )
`;

// Get all tenants
router.get("/tenants", async (req, res) => {
  try {
    const query = `${DEVICE_SECTOR_MAP_CTE}
      SELECT DISTINCT
        c.cat_clientes_id as id,
        c.clientes_descripcion as name
      FROM gold.dashboard_readings d
      LEFT JOIN device_sector_map m
        ON d.device_id = m.device_id
      JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      ORDER BY c.clientes_descripcion
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

// Get all ranches for a tenant
router.get("/ranches/:tenantId", numericParam("tenantId"), validate, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const query = `${DEVICE_SECTOR_MAP_CTE}
      SELECT DISTINCT
        r.cat_ranchos_id as id,
        r.ranchos_descripcion as name
      FROM gold.dashboard_readings d
      LEFT JOIN device_sector_map m
        ON d.device_id = m.device_id
      JOIN cat_ranchos r
        ON r.cat_ranchos_id = COALESCE(d.cat_ranchos_id, m.rancho_id)
      WHERE COALESCE(d.cat_clientes_id, m.cliente_id) = $1
      ORDER BY r.ranchos_descripcion
    `;
    const result = await pool.query(query, [tenantId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching ranches:", err);
    res.status(500).json({ error: "Failed to fetch ranches" });
  }
});

// Get sectors for a ranch
router.get("/sectors/:ranchId", numericParam("ranchId"), validate, async (req, res) => {
  try {
    const { ranchId } = req.params;
    const query = `
      SELECT DISTINCT
        s.cat_sectores_id as id,
        s.sector_descripcion as name,
        s.cat_ranchos_id as ranch_id
      FROM cat_sectores s
      WHERE s.cat_ranchos_id = $1
      ORDER BY s.sector_descripcion
    `;
    const result = await pool.query(query, [ranchId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sectors:", err);
    res.status(500).json({ error: "Failed to fetch sectors" });
  }
});

// Get latest readings for sectors in a ranch
router.get("/readings/ranch/:ranchId", numericParam("ranchId"), validate, async (req, res) => {
  try {
    const { ranchId } = req.params;
    const query = `${DEVICE_SECTOR_MAP_CTE}
      SELECT DISTINCT ON (COALESCE(d.cat_sectores_id, m.sector_id))
        d.id,
        d.device_id,
        COALESCE(d.cat_sectores_id, m.sector_id) as sector_id,
        COALESCE(d.cat_ranchos_id, m.rancho_id) as ranch_id,
        COALESCE(d.cat_clientes_id, m.cliente_id) as tenant_id,
        COALESCE(s.sector_descripcion, COALESCE(d.cat_sectores_id, m.sector_id)::text) as sector_name,
        COALESCE(r.ranchos_descripcion, COALESCE(d.cat_ranchos_id, m.rancho_id)::text) as ranch_name,
        COALESCE(c.clientes_descripcion, COALESCE(d.cat_clientes_id, m.cliente_id)::text) as tenant_name,
        d.air_temperature,
        d.relative_humidity,
        d.soil_temperature,
        d.soil_humidity,
        d.soil_conductivity,
        d.battery_voltage,
        d.timestamp_converted,
        d.reading_date
      FROM gold.dashboard_readings d
      LEFT JOIN device_sector_map m
        ON d.device_id = m.device_id
      LEFT JOIN cat_sectores s
        ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
      LEFT JOIN cat_ranchos r
        ON r.cat_ranchos_id = COALESCE(d.cat_ranchos_id, m.rancho_id)
      LEFT JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      WHERE COALESCE(d.cat_ranchos_id, m.rancho_id) = $1
      ORDER BY COALESCE(d.cat_sectores_id, m.sector_id), d.timestamp_converted DESC
    `;
    const result = await pool.query(query, [ranchId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching readings:", err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// Get all data for dashboard (ranches with their sectors and latest readings)
router.get("/dashboard/:tenantId", numericParam("tenantId"), validate, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // First get all ranches
    const ranchesQuery = `${DEVICE_SECTOR_MAP_CTE}
      SELECT DISTINCT
        r.cat_ranchos_id as id,
        r.ranchos_descripcion as name
      FROM gold.dashboard_readings d
      LEFT JOIN device_sector_map m
        ON d.device_id = m.device_id
      JOIN cat_ranchos r
        ON r.cat_ranchos_id = COALESCE(d.cat_ranchos_id, m.rancho_id)
      WHERE COALESCE(d.cat_clientes_id, m.cliente_id) = $1
      ORDER BY r.ranchos_descripcion
    `;
    const ranchesResult = await pool.query(ranchesQuery, [tenantId]);

    // For each ranch, get its sectors with latest readings
    const ranches = await Promise.all(
      ranchesResult.rows.map(async (ranch) => {
        // Get sectors for this ranch
        const sectorsQuery = `${DEVICE_SECTOR_MAP_CTE}
        SELECT DISTINCT ON (COALESCE(d.cat_sectores_id, m.sector_id))
          COALESCE(d.cat_sectores_id, m.sector_id) as id,
          COALESCE(s.sector_descripcion, COALESCE(d.cat_sectores_id, m.sector_id)::text) as name,
          d.air_temperature,
          d.relative_humidity,
          d.soil_temperature,
          d.soil_humidity,
          d.soil_conductivity,
          d.battery_voltage,
          d.timestamp_converted
        FROM gold.dashboard_readings d
        LEFT JOIN device_sector_map m
          ON d.device_id = m.device_id
        LEFT JOIN cat_sectores s
          ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
        WHERE COALESCE(d.cat_ranchos_id, m.rancho_id) = $1
        ORDER BY COALESCE(d.cat_sectores_id, m.sector_id), d.timestamp_converted DESC
      `;
        const sectorsResult = await pool.query(sectorsQuery, [ranch.id]);

        // Calculate etapa fenologica based on readings (placeholder logic)
        const sectors = sectorsResult.rows.map((sector) => ({
          ...sector,
          // Placeholder - you need to define your own logic
          etapaFenologica: getEtapaFenologica(sector),
        }));

        return {
          ...ranch,
          sectors,
        };
      })
    );

    res.json(ranches);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Admin overview: all tenants with their ranches and latest sector readings
router.get("/admin/overview", async (req, res) => {
  try {
    const tenantsQuery = `${DEVICE_SECTOR_MAP_CTE}
      SELECT DISTINCT
        c.cat_clientes_id as id,
        c.clientes_descripcion as name
      FROM gold.dashboard_readings d
      LEFT JOIN device_sector_map m
        ON d.device_id = m.device_id
      JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      ORDER BY c.clientes_descripcion
    `;
    const tenantsResult = await pool.query(tenantsQuery);

    const tenants = await Promise.all(
      tenantsResult.rows.map(async (tenant) => {
        const ranchesQuery = `${DEVICE_SECTOR_MAP_CTE}
        SELECT DISTINCT
          r.cat_ranchos_id as id,
          r.ranchos_descripcion as name
        FROM gold.dashboard_readings d
        LEFT JOIN device_sector_map m
          ON d.device_id = m.device_id
        JOIN cat_ranchos r
          ON r.cat_ranchos_id = COALESCE(d.cat_ranchos_id, m.rancho_id)
        WHERE COALESCE(d.cat_clientes_id, m.cliente_id) = $1
        ORDER BY r.ranchos_descripcion
      `;
        const ranchesResult = await pool.query(ranchesQuery, [tenant.id]);

        const ranches = await Promise.all(
          ranchesResult.rows.map(async (ranch) => {
            const sectorsQuery = `${DEVICE_SECTOR_MAP_CTE}
          SELECT DISTINCT ON (COALESCE(d.cat_sectores_id, m.sector_id))
            COALESCE(d.cat_sectores_id, m.sector_id) as id,
            COALESCE(s.sector_descripcion, COALESCE(d.cat_sectores_id, m.sector_id)::text) as name,
            d.air_temperature,
            d.relative_humidity,
            d.soil_temperature,
            d.soil_humidity,
            d.soil_conductivity,
            d.battery_voltage,
            d.timestamp_converted
          FROM gold.dashboard_readings d
          LEFT JOIN device_sector_map m
            ON d.device_id = m.device_id
          LEFT JOIN cat_sectores s
            ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
          WHERE COALESCE(d.cat_ranchos_id, m.rancho_id) = $1
          ORDER BY COALESCE(d.cat_sectores_id, m.sector_id), d.timestamp_converted DESC
        `;
            const sectorsResult = await pool.query(sectorsQuery, [ranch.id]);
            const sectors = sectorsResult.rows.map((sector) => ({
              ...sector,
              etapaFenologica: getEtapaFenologica(sector),
            }));

            return {
              ...ranch,
              sectors,
            };
          })
        );

        return {
          ...tenant,
          ranches,
        };
      })
    );

    res.json(tenants);
  } catch (err) {
    console.error("Error fetching admin overview:", err);
    res.status(500).json({ error: "Failed to fetch admin overview" });
  }
});

// Admin: latest readings per device for a sector
router.get("/admin/sectors/:sectorId/devices", numericParam("sectorId"), validate, async (req, res) => {
  try {
    const { sectorId } = req.params;
    const query = `
      SELECT DISTINCT ON (device_id)
        device_id,
        CONCAT(UPPER(LEFT(COALESCE(c.clientes_descripcion, ''), 3)), RIGHT(device_id::text, 4)) AS device_alias,
        d.cat_clientes_id as tenant_id,
        c.clientes_descripcion as tenant_name,
        d.cat_ranchos_id as ranch_id,
        r.ranchos_descripcion as ranch_name,
        s.sector_descripcion as sector,
        d.air_temperature,
        d.relative_humidity,
        d.soil_temperature,
        d.soil_humidity,
        d.soil_conductivity,
        d.battery_voltage,
        d.timestamp_converted
      FROM gold.dashboard_readings d
      LEFT JOIN (
        SELECT DISTINCT ON (device_id)
          device_id,
          sector_id,
          rancho_id,
          cliente_id
        FROM gold.v_transpiration_efficiency
        ORDER BY device_id, timestamp DESC
      ) m ON d.device_id = m.device_id
      LEFT JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      LEFT JOIN cat_ranchos r
        ON r.cat_ranchos_id = COALESCE(d.cat_ranchos_id, m.rancho_id)
      LEFT JOIN cat_sectores s
        ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
      WHERE COALESCE(d.cat_sectores_id, m.sector_id) = $1
      ORDER BY device_id, d.timestamp_converted DESC
    `;
    const result = await pool.query(query, [sectorId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sector devices:", err);
    res.status(500).json({ error: "Failed to fetch sector devices" });
  }
});

// Admin: readings for a device within a time range
router.get("/admin/devices/:deviceId/readings", numericParam("deviceId"), rangeQuery, validate, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const interval = resolveInterval(req.query.range, "60d");

    const query = `
      SELECT
        device_id,
        CONCAT(UPPER(LEFT(COALESCE(c.clientes_descripcion, ''), 3)), RIGHT(device_id::text, 4)) AS device_alias,
        d.cat_clientes_id as tenant_id,
        c.clientes_descripcion as tenant_name,
        d.cat_ranchos_id as ranch_id,
        COALESCE(d.cat_sectores_id, m.sector_id) as sector_id,
        s.sector_descripcion as sector,
        d.air_temperature,
        d.relative_humidity,
        d.soil_temperature,
        d.soil_humidity,
        d.soil_conductivity,
        d.battery_voltage,
        d.timestamp_converted
      FROM gold.dashboard_readings d
      LEFT JOIN (
        SELECT DISTINCT ON (device_id)
          device_id,
          sector_id,
          cliente_id
        FROM gold.v_transpiration_efficiency
        ORDER BY device_id, timestamp DESC
      ) m ON d.device_id = m.device_id
      LEFT JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      LEFT JOIN cat_sectores s
        ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
      WHERE d.device_id = $1
        AND d.timestamp_converted >= NOW() - $2::interval
      ORDER BY d.timestamp_converted ASC
    `;
    const result = await pool.query(query, [deviceId, interval]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching device readings:", err);
    res.status(500).json({ error: "Failed to fetch device readings" });
  }
});

// Admin: readings for all devices in a sector within a time range
router.get("/admin/sectors/:sectorId/readings", numericParam("sectorId"), rangeQuery, validate, async (req, res) => {
  try {
    const { sectorId } = req.params;
    const interval = resolveInterval(req.query.range, "24h");

    const query = `
      SELECT
        device_id,
        CONCAT(UPPER(LEFT(COALESCE(c.clientes_descripcion, ''), 3)), RIGHT(device_id::text, 4)) AS device_alias,
        d.cat_clientes_id as tenant_id,
        c.clientes_descripcion as tenant_name,
        d.cat_ranchos_id as ranch_id,
        d.cat_sectores_id as sector_id,
        s.sector_descripcion as sector,
        d.air_temperature,
        d.relative_humidity,
        d.soil_temperature,
        d.soil_humidity,
        d.soil_conductivity,
        d.battery_voltage,
        d.timestamp_converted
      FROM gold.dashboard_readings d
      LEFT JOIN (
        SELECT DISTINCT ON (device_id)
          device_id,
          sector_id,
          cliente_id
        FROM gold.v_transpiration_efficiency
        ORDER BY device_id, timestamp DESC
      ) m ON d.device_id = m.device_id
      LEFT JOIN cat_clientes c
        ON c.cat_clientes_id = COALESCE(d.cat_clientes_id, m.cliente_id)
      LEFT JOIN cat_sectores s
        ON s.cat_sectores_id = COALESCE(d.cat_sectores_id, m.sector_id)
      WHERE COALESCE(d.cat_sectores_id, m.sector_id) = $1
        AND d.timestamp_converted >= NOW() - $2::interval
      ORDER BY device_id, d.timestamp_converted ASC
    `;
    const result = await pool.query(query, [sectorId, interval]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sector readings:", err);
    res.status(500).json({ error: "Failed to fetch sector readings" });
  }
});

// Transpiration efficiency series by sector
router.get("/transpiration-efficiency/:sectorId", numericParam("sectorId"), rangeQuery, validate, async (req, res) => {
  try {
    const { sectorId } = req.params;
    const interval = resolveInterval(req.query.range, "60d");

    const query = `
      SELECT
        sector_id,
        f_vpd,
        soil_theta_disponible,
        timestamp
      FROM gold.v_transpiration_efficiency
      WHERE sector_id = $1
        AND timestamp >= NOW() - $2::interval
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [sectorId, interval]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transpiration efficiency:", err);
    res.status(500).json({ error: "Failed to fetch transpiration efficiency" });
  }
});

// Get dashboard summary
router.get("/summary/:tenantId", numericParam("tenantId"), validate, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const query = `
      SELECT 
        COUNT(DISTINCT cat_ranchos_id) as total_ranchos,
        COUNT(DISTINCT cat_sectores_id) as total_sectores,
        COUNT(DISTINCT device_id) as total_dispositivos,
        AVG(air_temperature) as avg_temperature,
        AVG(relative_humidity) as avg_humidity,
        AVG(soil_conductivity) as avg_conductivity,
        MAX(timestamp_converted) as last_update
      FROM gold.dashboard_readings
      WHERE cat_clientes_id = $1
    `;
    const result = await pool.query(query, [tenantId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Helper function to determine phenological stage
// This should be customized based on your business logic
function getEtapaFenologica(sector) {
  // Placeholder logic - replace with actual business logic
  // For now, we'll use a simple hash based on sector name
  const stages = [
    "germinacion",
    "crecimiento",
    "floracion",
    "fructificacion",
    "maduracion",
  ];
  const hash = sector.name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return stages[hash % stages.length];
}

module.exports = router;
