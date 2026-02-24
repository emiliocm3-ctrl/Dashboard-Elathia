import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";

const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useDashboardData(tenantId, isAdmin, refreshInterval = DEFAULT_REFRESH_INTERVAL) {
  const [ranchesData, setRanchesData] = useState([]);
  const [tenantsData, setTenantsData] = useState([]);
  const [adminOverview, setAdminOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const intervalRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [tenants, overview] = await Promise.all([
          api.getTenants(),
          api.getAdminOverview(),
        ]);
        setTenantsData(tenants);
        setAdminOverview(overview);
      } else {
        const data = await api.getDashboard(tenantId);
        setRanchesData(data);
      }
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, tenantId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboardData, refreshInterval]);

  const getSectorsForRanch = useCallback(
    (ranchId, selectedRanch) => {
      if (selectedRanch?.sectors) return selectedRanch.sectors;
      const ranch = ranchesData.find((r) => r.id === ranchId);
      return ranch ? ranch.sectors : [];
    },
    [ranchesData]
  );

  return {
    ranchesData,
    tenantsData,
    adminOverview,
    loading,
    error,
    lastRefreshed,
    refetch: fetchDashboardData,
    getSectorsForRanch,
  };
}

export function useAdminSectorData(sectorId, deviceRange, isAdmin, isActive) {
  const [adminDevices, setAdminDevices] = useState([]);
  const [adminDeviceReadings, setAdminDeviceReadings] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || !isActive || !sectorId) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const devices = await api.getAdminSectorDevices(sectorId);
        if (cancelled) return;
        setAdminDevices(devices);

        const readings = await api.getAdminSectorReadings(
          sectorId,
          deviceRange
        );
        if (cancelled) return;
        const grouped = readings.reduce((acc, reading) => {
          if (!acc[reading.device_id]) acc[reading.device_id] = [];
          acc[reading.device_id].push(reading);
          return acc;
        }, {});
        setAdminDeviceReadings(grouped);
        if (devices.length) {
          setSelectedDevice((prev) => prev || devices[0].device_id);
        }
      } catch (err) {
        console.error("Failed to load admin sector data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [sectorId, deviceRange, isAdmin, isActive]);

  const reset = useCallback(() => {
    setAdminDevices([]);
    setAdminDeviceReadings({});
    setSelectedDevice(null);
  }, []);

  return {
    adminDevices,
    adminDeviceReadings,
    selectedDevice,
    setSelectedDevice,
    loading,
    reset,
  };
}

export function useTranspirationData(sectors, isActive) {
  const [seriesBySector, setSeriesBySector] = useState({});

  useEffect(() => {
    if (!isActive || !sectors?.length) {
      setSeriesBySector({});
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const responses = await Promise.all(
          sectors.map(async (sector) => {
            const series = await api.getTranspirationEfficiency(
              sector.id,
              "60d"
            );
            return [sector.id, series];
          })
        );
        if (cancelled) return;
        const bySector = Object.fromEntries(responses);
        setSeriesBySector(bySector);
      } catch (err) {
        console.error("Failed to load transpiration efficiency:", err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [sectors, isActive]);

  return seriesBySector;
}
