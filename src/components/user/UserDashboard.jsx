import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  useDashboardData,
  useTranspirationData,
} from "../../hooks/useDashboardData";
import AppLayout from "../layout/AppLayout";
import ErrorBoundary from "../ErrorBoundary";
import { SkeletonGrid } from "../SkeletonCard";
import { UserHero } from "../shared/DashboardHero";
import UserRanchCard from "./UserRanchCard";
import UserSectorCard from "./UserSectorCard";
import UserSectorDetail from "./UserSectorDetail";
import "./user.css";

export default function UserDashboard() {
  const { t } = useTranslation();
  const { ranchId: urlRanchId, sectorId: urlSectorId } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useAuth();

  const {
    ranchesData,
    loading,
    error,
    lastRefreshed,
    refetch,
    getSectorsForRanch,
  } = useDashboardData(tenantId, false);

  const currentView = urlSectorId ? "sector" : urlRanchId ? "ranch" : "ranches";

  const selectedRanch = useMemo(() => {
    if (!urlRanchId) return null;
    const id = isNaN(urlRanchId) ? urlRanchId : Number(urlRanchId);
    return ranchesData.find((r) => r.id === id) || null;
  }, [urlRanchId, ranchesData]);

  const selectedSectorId = urlSectorId
    ? isNaN(urlSectorId) ? urlSectorId : Number(urlSectorId)
    : null;

  const sectors = useMemo(
    () => getSectorsForRanch(selectedRanch?.id, selectedRanch),
    [selectedRanch, getSectorsForRanch]
  );

  const selectedSector = useMemo(() => {
    if (!selectedSectorId || !sectors.length) return null;
    return sectors.find((s) => s.id === selectedSectorId) || null;
  }, [selectedSectorId, sectors]);

  const transpirationSeriesBySector = useTranspirationData(
    sectors,
    currentView === "ranch" || currentView === "sector"
  );

  const allSectors = useMemo(() => {
    return ranchesData.flatMap((r) => r.sectors || []);
  }, [ranchesData]);

  const handleViewRanch = useCallback((ranch) => navigate(`/ranches/${ranch.id}`), [navigate]);
  const handleViewSector = useCallback((sector) => navigate(`/ranches/${urlRanchId}/sectors/${sector.id}`), [navigate, urlRanchId]);
  const handleBackToRanches = useCallback(() => navigate("/"), [navigate]);
  const handleBackToSectors = useCallback(() => navigate(`/ranches/${urlRanchId}`), [navigate, urlRanchId]);

  const sidebarContent = currentView === "ranches" ? (
    <div className="user-sidebar">
      <div className="user-sidebar__title">{t('dashboard.ranches')}</div>
      <div className="user-sidebar__list">
        {ranchesData.map((r) => (
          <button
            key={r.id}
            className={`user-sidebar__item ${selectedRanch?.id === r.id ? "user-sidebar__item--active" : ""}`}
            onClick={() => handleViewRanch(r)}
            type="button"
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  ) : currentView === "ranch" ? (
    <div className="user-sidebar">
      <button className="user-sidebar__back" type="button" onClick={handleBackToRanches}>← {t('dashboard.ranches')}</button>
      <div className="user-sidebar__title">{selectedRanch?.name}</div>
      <div className="user-sidebar__list">
        {sectors.map((s) => (
          <button
            key={s.id}
            className={`user-sidebar__item ${selectedSector?.id === s.id ? "user-sidebar__item--active" : ""}`}
            onClick={() => handleViewSector(s)}
            type="button"
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <AppLayout sidebar={sidebarContent}>
      <ErrorBoundary>
        {currentView === "ranches" && (
          <div className="user-view">
            <UserHero sectors={allSectors} lastRefreshed={lastRefreshed} />
            <div className="user-view__header">
              <h1>{t('dashboard.ranches')}</h1>
              <button className="user-view__refresh" type="button" onClick={refetch}>{t('dashboard.refresh')}</button>
            </div>
            {loading ? (
              <SkeletonGrid count={3} type="ranch" />
            ) : error ? (
              <div className="user-view__error">{error}</div>
            ) : ranchesData.length === 0 ? (
              <div className="user-view__empty">{t('dashboard.noData')}</div>
            ) : (
              <div className="user-view__grid">
                {ranchesData.map((ranch, i) => (
                  <UserRanchCard
                    key={ranch.id}
                    ranch={ranch}
                    onViewRanch={handleViewRanch}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "ranch" && (
          <div className="user-view">
            <div className="user-view__header">
              <div>
                <button className="user-view__back-link" type="button" onClick={handleBackToRanches}>← {t('dashboard.ranches')}</button>
                <h1>{selectedRanch?.name}</h1>
              </div>
              <button className="user-view__refresh" type="button" onClick={refetch}>{t('dashboard.refresh')}</button>
            </div>
            {loading ? (
              <SkeletonGrid count={3} type="sector" />
            ) : (
              <div className="user-view__grid">
                {sectors.map((sector, i) => (
                  <UserSectorCard
                    key={sector.id}
                    sector={sector}
                    onViewSector={handleViewSector}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "sector" && (
          <UserSectorDetail
            sectorName={selectedSector?.name}
            zoneName={selectedRanch?.name || "Zona"}
            sectorData={selectedSector}
            transpirationSeries={transpirationSeriesBySector[selectedSectorId] || []}
            onBack={handleBackToSectors}
            onRefresh={refetch}
          />
        )}
      </ErrorBoundary>
    </AppLayout>
  );
}
