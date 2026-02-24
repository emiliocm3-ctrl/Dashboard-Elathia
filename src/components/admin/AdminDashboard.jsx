import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { ASSETS } from "../../config/assets";
import {
  useDashboardData,
  useAdminSectorData,
  useTranspirationData,
} from "../../hooks/useDashboardData";
import AppLayout from "../layout/AppLayout";
import Sidebar from "../Sidebar";
import { AdminHero } from "../shared/DashboardHero";
import SectorDetailView from "../SectorDetailView";
import RanchCard from "../RanchCard";
import SectorCard from "../SectorCard";
import DeviceCard from "../DeviceCard";
import ErrorBoundary from "../ErrorBoundary";
import { SkeletonGrid } from "../SkeletonCard";
import "./admin.css";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { ranchId: urlRanchId, sectorId: urlSectorId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, tenantId } = useAuth();

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deviceRange, setDeviceRange] = useState("24h");
  const [lastUpdate] = useState(
    new Date().toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const {
    ranchesData,
    tenantsData,
    adminOverview,
    loading,
    error,
    refetch,
    getSectorsForRanch,
  } = useDashboardData(tenantId, isAdmin);

  const currentView = urlSectorId ? "sector" : urlRanchId ? "ranch" : "ranches";

  const selectedRanch = useMemo(() => {
    if (!urlRanchId) return null;
    const id = isNaN(urlRanchId) ? urlRanchId : Number(urlRanchId);
    if (isAdmin) {
      for (const tenant of adminOverview) {
        const match = tenant.ranches?.find((r) => r.id === id);
        if (match) return { ...match, tenantId: tenant.id, tenantName: tenant.name };
      }
      return null;
    }
    return ranchesData.find((r) => r.id === id) || null;
  }, [urlRanchId, ranchesData, adminOverview, isAdmin]);

  const selectedSectorId = urlSectorId
    ? isNaN(urlSectorId) ? urlSectorId : Number(urlSectorId)
    : null;

  const sectors = useMemo(
    () => getSectorsForRanch(selectedRanch?.id, selectedRanch),
    [selectedRanch, getSectorsForRanch]
  );

  const selectedSectorName = useMemo(() => {
    if (!selectedSectorId || !sectors.length) return null;
    const s = sectors.find((sec) => sec.id === selectedSectorId);
    return s?.name || null;
  }, [selectedSectorId, sectors]);

  const {
    adminDevices,
    adminDeviceReadings,
    selectedDevice,
    setSelectedDevice,
    reset: resetAdminData,
  } = useAdminSectorData(selectedSectorId, deviceRange, isAdmin, currentView === "sector");

  const transpirationSeriesBySector = useTranspirationData(sectors, currentView === "ranch");

  const getAdminRanches = useCallback(() => {
    if (!adminOverview.length) return [];
    if (!selectedTenant) {
      return adminOverview.flatMap((tenant) =>
        tenant.ranches.map((ranch) => ({ ...ranch, tenantId: tenant.id, tenantName: tenant.name }))
      );
    }
    return selectedTenant.ranches.map((ranch) => ({
      ...ranch, tenantId: selectedTenant.id, tenantName: selectedTenant.name,
    }));
  }, [adminOverview, selectedTenant]);

  const ranchesForView = (isAdmin ? getAdminRanches() : ranchesData).filter((r) => r && r.name);

  const handleViewRanch = useCallback((ranch) => navigate(`/ranches/${ranch.id}`), [navigate]);
  const handleViewSector = useCallback((sector) => navigate(`/ranches/${urlRanchId}/sectors/${sector.id}`), [navigate, urlRanchId]);
  const handleBackToRanches = useCallback(() => { resetAdminData(); navigate("/"); }, [navigate, resetAdminData]);
  const handleBackToSectors = useCallback(() => navigate(`/ranches/${urlRanchId}`), [navigate, urlRanchId]);

  const handleSidebarItemClick = useCallback((item) => {
    if (currentView === "ranches") {
      if (isAdmin) {
        if (item === "Todos los clientes") { setSelectedTenant(null); return; }
        const tenant = adminOverview.find((t) => t.name === item);
        setSelectedTenant(tenant || null);
        return;
      }
      const ranch = ranchesData.find((r) => r.name === item);
      if (ranch) handleViewRanch(ranch);
    } else if (currentView === "ranch") {
      navigate(`/ranches/${urlRanchId}/sectors/${item.id}`);
    }
  }, [currentView, isAdmin, adminOverview, ranchesData, handleViewRanch, navigate, urlRanchId]);

  const sidebarContent = (
    <Sidebar
      title={
        currentView === "ranches"
          ? isAdmin ? "Administrador" : "Mis Ranchos"
          : currentView === "ranch"
          ? selectedRanch?.name
          : selectedSectorName
      }
      items={
        currentView === "ranches"
          ? isAdmin
            ? ["Todos los clientes", ...tenantsData.map((t) => t.name)]
            : ranchesData.map((r) => r.name)
          : currentView === "ranch"
          ? sectors.map((s) => ({ id: s.id, label: s.name }))
          : []
      }
      selectedItem={selectedSectorName || selectedRanch?.name}
      onItemClick={handleSidebarItemClick}
      onLogout={() => navigate("/")}
      onTitleClick={currentView === "ranches" ? undefined : handleBackToRanches}
    />
  );

  return (
    <AppLayout sidebar={sidebarContent}>
      <ErrorBoundary>
        {currentView === "ranches" && (
          <>
            {isAdmin && !selectedTenant && <AdminHero overview={adminOverview} />}
            <section className="admin-header">
              <div>
                <h1>
                  {isAdmin
                    ? selectedTenant
                      ? `${t('dashboard.ranches')} - ${selectedTenant.name}`
                      : t('dashboard.allTenants')
                    : t('dashboard.ranches')}
                </h1>
                <p className="admin-header__sub">
                  {ranchesForView.length} {t('dashboard.ranches').toLowerCase()} • {t('dashboard.lastUpdate')}: {lastUpdate}
                </p>
              </div>
              <button className="admin-btn" type="button" onClick={refetch}>
                <img src={ASSETS.icons.refresh} alt="" width="16" height="16" />
                {t('dashboard.refresh')}
              </button>
            </section>
            <section className="admin-grid">
              {loading ? (
                <SkeletonGrid count={3} type="ranch" />
              ) : error ? (
                <div className="admin-empty">{error}</div>
              ) : ranchesForView.length === 0 ? (
                <div className="admin-empty">No hay ranchos disponibles.</div>
              ) : (
                ranchesForView.map((ranch) => (
                  <RanchCard
                    key={`${ranch.tenantId || "t"}-${ranch.id}`}
                    ranch={ranch}
                    onViewRanch={handleViewRanch}
                  />
                ))
              )}
            </section>
          </>
        )}

        {currentView === "ranch" && (
          <>
            <section className="admin-header">
              <div>
                <h1>{selectedRanch?.name}</h1>
                <p className="admin-header__sub">{t('dashboard.sectors')} • {lastUpdate}</p>
              </div>
              <div className="admin-header__actions">
                <button className="admin-btn admin-btn--outline" type="button" onClick={handleBackToRanches}>
                  ← {t('nav.back')}
                </button>
                <button className="admin-btn" type="button" onClick={refetch}>
                  <img src={ASSETS.icons.refresh} alt="" width="16" height="16" />
                  {t('dashboard.refresh')}
                </button>
              </div>
            </section>
            <section className="admin-grid">
              {loading ? (
                <SkeletonGrid count={3} type="sector" />
              ) : (
                sectors.map((sector) => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    transpirationSeries={transpirationSeriesBySector[sector.id] || []}
                    onViewSector={() => handleViewSector(sector)}
                  />
                ))
              )}
            </section>
          </>
        )}

        {currentView === "sector" && (
          <>
            <SectorDetailView
              sectorName={selectedSectorName}
              zoneName={selectedRanch?.name || "Zona"}
              onBack={handleBackToSectors}
              onRefresh={refetch}
              sectorData={sectors.find((s) => s.id === selectedSectorId)}
              devices={adminDevices}
              deviceReadings={adminDeviceReadings}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
              deviceRange={deviceRange}
              onChangeDeviceRange={setDeviceRange}
              isAdmin={isAdmin}
            />
            {isAdmin && adminDevices.length > 0 && (
              <section className="admin-devices">
                <h3>{t('dashboard.devices')}</h3>
                <div className="admin-devices__grid">
                  {adminDevices.map((device) => (
                    <DeviceCard
                      key={device.device_id}
                      device={device}
                      readings={adminDeviceReadings[device.device_id] || []}
                      onSelect={setSelectedDevice}
                      isSelected={device.device_id === selectedDevice}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </ErrorBoundary>
    </AppLayout>
  );
}
