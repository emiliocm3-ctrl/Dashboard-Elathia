const now = new Date();
const ago = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();

function rand(min, max, dec = 1) {
  return +(min + Math.random() * (max - min)).toFixed(dec);
}

function timeSeries(count, minuteStep, generator) {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: ago(count * minuteStep - i * minuteStep),
    ...generator(i, count),
  }));
}

const SECTORS_BY_RANCH = {
  1: [
    { id: 101, name: "Sector Aguacate Norte", ranch_id: 1, etapaFenologica: "crecimiento" },
    { id: 102, name: "Sector Aguacate Sur", ranch_id: 1, etapaFenologica: "floracion" },
    { id: 103, name: "Sector Berries", ranch_id: 1, etapaFenologica: "fructificacion" },
  ],
  2: [
    { id: 201, name: "Sector Maíz A", ranch_id: 2, etapaFenologica: "germinacion" },
    { id: 202, name: "Sector Maíz B", ranch_id: 2, etapaFenologica: "crecimiento" },
  ],
  3: [
    { id: 301, name: "Sector Vid Tempranillo", ranch_id: 3, etapaFenologica: "maduracion" },
    { id: 302, name: "Sector Vid Cabernet", ranch_id: 3, etapaFenologica: "floracion" },
    { id: 303, name: "Sector Vid Merlot", ranch_id: 3, etapaFenologica: "fructificacion" },
    { id: 304, name: "Sector Olivo", ranch_id: 3, etapaFenologica: "crecimiento" },
  ],
};

function makeSectorReadings(sector) {
  return {
    ...sector,
    air_temperature: rand(18, 34),
    relative_humidity: rand(40, 85, 0),
    soil_temperature: rand(16, 30),
    soil_humidity: rand(30, 75, 0),
    soil_conductivity: rand(0.8, 3.2),
    battery_voltage: rand(3.2, 4.2),
    timestamp_converted: ago(rand(2, 30, 0)),
  };
}

const RANCHES = [
  { id: 1, name: "Rancho El Nogal" },
  { id: 2, name: "Rancho La Esperanza" },
  { id: 3, name: "Rancho Valle Verde" },
].map((ranch) => ({
  ...ranch,
  sectors: SECTORS_BY_RANCH[ranch.id].map(makeSectorReadings),
}));

function makeDevice(sectorId, idx) {
  const id = sectorId * 10 + idx;
  return {
    device_id: id,
    device_alias: `SEN${String(id).padStart(4, "0")}`,
    sector_id: sectorId,
    air_temperature: rand(19, 33),
    relative_humidity: rand(45, 82, 0),
    soil_temperature: rand(17, 29),
    soil_humidity: rand(32, 70, 0),
    soil_conductivity: rand(1.0, 2.8),
    battery_voltage: rand(3.4, 4.1),
    timestamp_converted: ago(rand(1, 20, 0)),
  };
}

function makeDeviceReadings(deviceId, range) {
  const counts = { "8h": 48, "24h": 96, "7d": 168, "30d": 360, "60d": 720, "90d": 1080 };
  const n = counts[range] || 96;
  const minuteStep = range === "8h" ? 10 : range === "24h" ? 15 : range === "7d" ? 60 : 120;
  return timeSeries(n, minuteStep, (i, total) => {
    const progress = i / total;
    return {
      device_id: deviceId,
      air_temperature: rand(18, 32) + Math.sin(progress * Math.PI * 4) * 3,
      relative_humidity: rand(45, 80, 0),
      soil_temperature: rand(16, 28),
      soil_humidity: rand(35, 68, 0),
      soil_conductivity: rand(1.0, 2.5),
      battery_voltage: rand(3.3, 4.1),
      timestamp_converted: ago((total - i) * minuteStep),
    };
  });
}

function makeTranspirationSeries(sectorId, range) {
  const counts = { "8h": 24, "24h": 48, "7d": 168, "30d": 360, "60d": 720, "90d": 1080 };
  const n = counts[range] || 720;
  const minuteStep = range === "8h" ? 20 : range === "24h" ? 30 : 60;
  return timeSeries(n, minuteStep, (i, total) => {
    const hour = (i * minuteStep / 60) % 24;
    const dayFactor = hour > 6 && hour < 20 ? 1 : 0.2;
    return {
      sector_id: sectorId,
      f_vpd: +(0.3 + dayFactor * rand(0, 0.6)).toFixed(3),
      soil_theta_disponible: +(0.4 + rand(0, 0.4)).toFixed(3),
    };
  });
}

const TENANTS = [
  { id: 1, name: "Agrícola del Norte S.A." },
  { id: 2, name: "Grupo Orgánico Valle" },
];

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms + Math.random() * 300));

export const mockApi = {
  async getDashboard(tenantId = 1) {
    await delay();
    return RANCHES;
  },

  async getRanches(tenantId = 1) {
    await delay();
    return RANCHES.map(({ sectors, ...r }) => r);
  },

  async getTenants() {
    await delay();
    return TENANTS;
  },

  async getSectors(ranchId) {
    await delay();
    return (SECTORS_BY_RANCH[ranchId] || []).map(makeSectorReadings);
  },

  async getReadings(ranchId) {
    await delay();
    const sectors = SECTORS_BY_RANCH[ranchId] || [];
    return sectors.map(makeSectorReadings);
  },

  async getSummary(tenantId = 1) {
    await delay();
    return {
      total_ranchos: RANCHES.length,
      total_sectores: Object.values(SECTORS_BY_RANCH).flat().length,
      total_dispositivos: 18,
      avg_temperature: rand(22, 28),
      avg_humidity: rand(55, 70, 0),
      avg_conductivity: rand(1.5, 2.2),
      last_update: ago(3),
    };
  },

  async getAdminOverview() {
    await delay();
    return TENANTS.map((tenant, idx) => ({
      ...tenant,
      ranches: idx === 0 ? RANCHES : [RANCHES[0]],
    }));
  },

  async getAdminSectorDevices(sectorId) {
    await delay();
    return [0, 1, 2].map((i) => makeDevice(Number(sectorId), i));
  },

  async getAdminDeviceReadings(deviceId, range = "24h") {
    await delay(100);
    return makeDeviceReadings(Number(deviceId), range);
  },

  async getAdminSectorReadings(sectorId, range = "24h") {
    await delay(100);
    const devices = [0, 1, 2].map((i) => Number(sectorId) * 10 + i);
    return devices.flatMap((did) =>
      makeDeviceReadings(did, range).map((r) => ({ ...r, device_id: did }))
    );
  },

  async getTranspirationEfficiency(sectorId, range = "60d") {
    await delay(100);
    return makeTranspirationSeries(Number(sectorId), range);
  },
};
