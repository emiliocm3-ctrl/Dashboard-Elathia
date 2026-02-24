const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const api = {
  // Get all dashboard data for a tenant
  async getDashboard(tenantId = 1) {
    try {
      const response = await fetch(`${API_URL}/dashboard/${tenantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      throw error;
    }
  },

  // Get all ranches for a tenant
  async getRanches(tenantId = 1) {
    try {
      const response = await fetch(`${API_URL}/ranches/${tenantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ranches");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching ranches:", error);
      throw error;
    }
  },

  // Get all tenants (admin)
  async getTenants() {
    try {
      const response = await fetch(`${API_URL}/tenants`);
      if (!response.ok) {
        throw new Error("Failed to fetch tenants");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }
  },

  // Get sectors for a ranch
  async getSectors(ranchId) {
    try {
      const response = await fetch(`${API_URL}/sectors/${ranchId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sectors");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching sectors:", error);
      throw error;
    }
  },

  // Get readings for a ranch
  async getReadings(ranchId) {
    try {
      const response = await fetch(`${API_URL}/readings/ranch/${ranchId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch readings");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching readings:", error);
      throw error;
    }
  },

  // Get dashboard summary
  async getSummary(tenantId = 1) {
    try {
      const response = await fetch(`${API_URL}/summary/${tenantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching summary:", error);
      throw error;
    }
  },

  // Admin overview (all tenants, ranches, sectors)
  async getAdminOverview() {
    try {
      const response = await fetch(`${API_URL}/admin/overview`);
      if (!response.ok) {
        throw new Error("Failed to fetch admin overview");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      throw error;
    }
  },

  // Admin: latest device readings for a sector
  async getAdminSectorDevices(sectorId) {
    try {
      const response = await fetch(
        `${API_URL}/admin/sectors/${encodeURIComponent(sectorId)}/devices`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sector devices");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching sector devices:", error);
      throw error;
    }
  },

  // Admin: readings for a device within a time range
  async getAdminDeviceReadings(deviceId, range = "24h") {
    try {
      const response = await fetch(
        `${API_URL}/admin/devices/${encodeURIComponent(
          deviceId
        )}/readings?range=${range}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch device readings");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching device readings:", error);
      throw error;
    }
  },

  // Admin: readings for all devices in a sector within a time range
  async getAdminSectorReadings(sectorId, range = "24h") {
    try {
      const response = await fetch(
        `${API_URL}/admin/sectors/${encodeURIComponent(
          sectorId
        )}/readings?range=${range}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sector readings");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching sector readings:", error);
      throw error;
    }
  },

  // Transpiration efficiency series for a sector
  async getTranspirationEfficiency(sectorId, range = "60d") {
    try {
      const response = await fetch(
        `${API_URL}/transpiration-efficiency/${encodeURIComponent(
          sectorId
        )}?range=${range}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transpiration efficiency");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching transpiration efficiency:", error);
      throw error;
    }
  },
};
