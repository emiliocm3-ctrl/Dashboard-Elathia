import { mockApi } from "./mockData";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === "true";

let backendAvailable = null;

async function checkBackend() {
  if (USE_MOCKS) return false;
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch(`${API_URL.replace("/api", "")}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

async function fetchOrMock(apiCall, mockCall) {
  const live = await checkBackend();
  if (!live) return mockCall();
  return apiCall();
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export const api = {
  async getDashboard(tenantId = 1) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/dashboard/${tenantId}`),
      () => mockApi.getDashboard(tenantId)
    );
  },

  async getRanches(tenantId = 1) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/ranches/${tenantId}`),
      () => mockApi.getRanches(tenantId)
    );
  },

  async getTenants() {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/tenants`),
      () => mockApi.getTenants()
    );
  },

  async getSectors(ranchId) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/sectors/${ranchId}`),
      () => mockApi.getSectors(ranchId)
    );
  },

  async getReadings(ranchId) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/readings/ranch/${ranchId}`),
      () => mockApi.getReadings(ranchId)
    );
  },

  async getSummary(tenantId = 1) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/summary/${tenantId}`),
      () => mockApi.getSummary(tenantId)
    );
  },

  async getAdminOverview() {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/admin/overview`),
      () => mockApi.getAdminOverview()
    );
  },

  async getAdminSectorDevices(sectorId) {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/admin/sectors/${encodeURIComponent(sectorId)}/devices`),
      () => mockApi.getAdminSectorDevices(sectorId)
    );
  },

  async getAdminDeviceReadings(deviceId, range = "24h") {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/admin/devices/${encodeURIComponent(deviceId)}/readings?range=${range}`),
      () => mockApi.getAdminDeviceReadings(deviceId, range)
    );
  },

  async getAdminSectorReadings(sectorId, range = "24h") {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/admin/sectors/${encodeURIComponent(sectorId)}/readings?range=${range}`),
      () => mockApi.getAdminSectorReadings(sectorId, range)
    );
  },

  async getTranspirationEfficiency(sectorId, range = "60d") {
    return fetchOrMock(
      () => fetchJSON(`${API_URL}/transpiration-efficiency/${encodeURIComponent(sectorId)}?range=${range}`),
      () => mockApi.getTranspirationEfficiency(sectorId, range)
    );
  },
};
