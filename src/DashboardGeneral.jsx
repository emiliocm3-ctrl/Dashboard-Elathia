import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DashboardGeneral.css";
import { ASSETS } from "./config/assets";
import { USER_GREETING } from "./config/constants";
import { useAuth } from "./context/AuthContext";
import {
  useDashboardData,
  useAdminSectorData,
  useTranspirationData,
} from "./hooks/useDashboardData";
import Logo from "./components/Logo";
import Sidebar from "./components/Sidebar";
import SectorDetailView from "./components/SectorDetailView";
import RanchCard from "./components/RanchCard";
import SectorCard from "./components/SectorCard";
import DeviceCard from "./components/DeviceCard";
import ErrorBoundary from "./components/ErrorBoundary";
import { SkeletonGrid } from "./components/SkeletonCard";
import MenuMovil from "./MenuMovil";

export default function DashboardGeneral() {
  const { ranchId: urlRanchId, sectorId: urlSectorId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, tenantId, logout, user } = useAuth();

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deviceRange, setDeviceRange] = useState("24h");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  } = useAdminSectorData(
    selectedSectorId,
    deviceRange,
    isAdmin,
    currentView === "sector"
  );

  const transpirationSeriesBySector = useTranspirationData(
    sectors,
    currentView === "ranch"
  );

  const getAdminRanches = () => {
    if (!adminOverview.length) return [];
    if (!selectedTenant) {
      return adminOverview.flatMap((tenant) =>
        tenant.ranches.map((ranch) => ({
          ...ranch,
          tenantId: tenant.id,
          tenantName: tenant.name,
        }))
      );
    }
    return selectedTenant.ranches.map((ranch) => ({
      ...ranch,
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
    }));
  };

  const ranchesForView = (isAdmin ? getAdminRanches() : ranchesData).filter(
    (ranch) => ranch && ranch.name
  );
  const ranchesCount = ranchesForView.length;

  const handleViewSector = (sector) => {
    navigate(`/ranches/${urlRanchId}/sectors/${sector.id}`);
  };

  const handleViewRanch = (ranch) => {
    navigate(`/ranches/${ranch.id}`);
  };

  const handleBackToRanches = () => {
    resetAdminData();
    navigate("/");
  };

  const handleBackToSectors = () => {
    navigate(`/ranches/${urlRanchId}`);
  };

  const handleSelectDevice = (deviceId) => {
    setSelectedDevice(deviceId);
  };

  const handleSidebarItemClick = (item) => {
    if (currentView === "ranches") {
      if (isAdmin) {
        if (item === "Todos los clientes") {
          setSelectedTenant(null);
          return;
        }
        const tenant = adminOverview.find((t) => t.name === item);
        setSelectedTenant(tenant || null);
        return;
      }
      const ranch = ranchesData.find((r) => r.name === item);
      if (ranch) handleViewRanch(ranch);
    } else if (currentView === "ranch") {
      const sectorId = item.id;
      navigate(`/ranches/${urlRanchId}/sectors/${sectorId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-general">
      <header className="topbar">
        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="brand">
          <Logo variant="full" />
        </div>
        <div className="topbar-user">
          <span className="muted">
            {USER_GREETING.message}, {user?.name || USER_GREETING.defaultName}
          </span>
          <span className="avatar" aria-hidden="true">
            <img src={ASSETS.icons.person} alt="" />
          </span>
        </div>
      </header>

      <Sidebar
        title={
          currentView === "ranches"
            ? isAdmin
              ? "Administrador"
              : "Mis Ranchos"
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
        onLogout={handleLogout}
        onTitleClick={currentView === "ranches" ? undefined : handleBackToRanches}
      />

      <main className="dashboard-content">
        <ErrorBoundary>
          {currentView === "ranches" && (
            <>
              <section className="header-block">
                <div className="header-title">
                  <h1>
                    {isAdmin
                      ? selectedTenant
                        ? `Ranchos de ${selectedTenant.name}`
                        : "Todos los Clientes"
                      : "Mis Ranchos"}
                  </h1>
                  <p>
                    {isAdmin
                      ? `Gestión de ${ranchesCount} ranchos en ${
                          selectedTenant ? "1" : tenantsData.length
                        } cliente${
                          selectedTenant || tenantsData.length === 1 ? "" : "s"
                        }`
                      : `Gestión de ${ranchesCount} ranchos`}{" "}
                    • Última actualización: {lastUpdate}
                  </p>
                </div>
                <button className="btn-outline" type="button" onClick={refetch}>
                  <span className="icon-24">
                    <img src={ASSETS.icons.refresh} alt="" />
                  </span>
                  Actualizar Datos
                </button>
              </section>

              <section className="ranch-grid">
                {loading ? (
                  <SkeletonGrid count={3} type="ranch" />
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : ranchesForView.length === 0 ? (
                  <div className="empty-message">
                    No hay ranchos disponibles.
                  </div>
                ) : (
                  ranchesForView.map((ranch) => (
                    <RanchCard
                      key={`${ranch.tenantId || "tenant"}-${ranch.id}`}
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
              <section className="header-block">
                <div className="header-title">
                  <h1>{selectedRanch?.name}</h1>
                  <p>
                    Sectores del rancho • Última actualización: {lastUpdate}
                  </p>
                </div>
                <div className="header-actions">
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={handleBackToRanches}
                  >
                    <span className="icon-24 rotate-90">
                      <img src={ASSETS.icons.chevron} alt="" />
                    </span>
                    Volver a Ranchos
                  </button>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={refetch}
                  >
                    <span className="icon-24">
                      <img src={ASSETS.icons.refresh} alt="" />
                    </span>
                    Actualizar Datos
                  </button>
                </div>
              </section>

              <section className="sector-cards-grid">
                {loading ? (
                  <SkeletonGrid count={3} type="sector" />
                ) : (
                  sectors.map((sector) => (
                    <SectorCard
                      key={sector.id}
                      sector={sector}
                      transpirationSeries={
                        transpirationSeriesBySector[sector.id] || []
                      }
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
                onSelectDevice={handleSelectDevice}
                deviceRange={deviceRange}
                onChangeDeviceRange={setDeviceRange}
                isAdmin={isAdmin}
              />
              {isAdmin && (
                <section className="device-grid">
                  {adminDevices.map((device) => (
                    <DeviceCard
                      key={device.device_id}
                      device={device}
                      readings={adminDeviceReadings[device.device_id] || []}
                      onSelect={handleSelectDevice}
                      isSelected={device.device_id === selectedDevice}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      <MenuMovil
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
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
