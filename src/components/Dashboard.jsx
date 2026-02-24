import { useState } from 'react';
import '../DashboardGeneral.css';
import { ASSETS } from '../config/assets';
import { SECTORS, METRICS, METRIC_KEYS, USER_GREETING } from '../constants';
import Logo from './Logo';
import Sidebar from './Sidebar';
import MetricCard from './MetricCard';
import SummaryBlock from './SummaryBlock';
import ChartCard from './ChartCard';

/**
 * Dashboard Component - Refactored and Consolidated
 * Replaces 12 duplicate dashboard files with a single parameterized component
 *
 * @param {Object} props
 * @param {string} props.title - Dashboard title
 * @param {string} props.subtitle - Dashboard subtitle
 * @param {string} props.userName - User's name for greeting
 * @param {Array} props.sectors - Array of sector data
 * @param {boolean} props.hasInternetConnection - Internet connection status
 */
export default function Dashboard({
  title = 'Control General',
  subtitle = 'Monitoreo tiempo real con 4 sectores',
  userName = USER_GREETING.defaultName,
  sectors = SECTORS,
  hasInternetConnection = true,
}) {
  const [selectedSector, setSelectedSector] = useState(null);
  const [lastUpdate] = useState(new Date().toLocaleString('es-ES'));

  const handleRefreshData = () => {
    console.log('Refreshing data...');
    // TODO: Implement data fetching
  };

  const handleViewSector = (sectorName) => {
    setSelectedSector(sectorName);
    console.log('Viewing sector:', sectorName);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // TODO: Implement logout logic
  };

  // Sample metrics data (to be replaced with real data from API)
  const getSectorMetrics = (sectorName) => [
    { label: 'Temperatura', value: '23.6°C', status: 'ok' },
    { label: 'Humedad', value: '76%', status: 'ok' },
    { label: 'Conductividad', value: '68%', status: 'ok' },
    { label: 'Radiación', value: '842 lux', status: 'ok' },
    { label: 'Nivel de pH', value: '6.2 pH', status: 'ok' },
  ];

  return (
    <div className="dashboard-general">
      {/* Header/Topbar */}
      <header className="topbar">
        <div className="brand">
          <Logo variant="mark" />
          <Logo variant="text" />
        </div>
        <div className="user-info">
          <span>
            {USER_GREETING.message}, {userName}
          </span>
          <span className="icon-32">
            <img src={ASSETS.icons.person} alt="" />
          </span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar
        title={title}
        items={sectors}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        {/* No Internet Warning */}
        {!hasInternetConnection && (
          <div className="alert alert-warning">
            <span className="icon-24">⚠️</span>
            Sin conexión a Internet. Los datos pueden estar desactualizados.
          </div>
        )}

        {/* Header Block */}
        <section className="header-block">
          <div className="header-title">
            <h1>{title}</h1>
            <p>
              {subtitle} • Última actualización: {lastUpdate}
            </p>
          </div>
          <button className="btn-outline" type="button" onClick={handleRefreshData}>
            <span className="icon-24">
              <img src={ASSETS.icons.refresh} alt="" />
            </span>
            Actualizar Datos
          </button>
        </section>

        {/* Sector Grid - Metric Cards */}
        <section className="sector-grid">
          {sectors.map((sector) => (
            <MetricCard
              key={sector}
              sectorName={sector}
              metrics={getSectorMetrics(sector)}
              onViewSector={() => handleViewSector(sector)}
            />
          ))}
        </section>

        {/* Summary Card */}
        <section className="summary-card">
          <SummaryBlock
            metricType="temperature"
            value="23.4"
            unit="°C"
            statusText="¡Bien! Estado óptimo."
            status="ok"
          />
          <div className="divider" />
          <SummaryBlock
            metricType="humidity"
            value="76"
            unit="%"
            statusText="¡Bien! Estado óptimo."
            status="ok"
          />
          <div className="divider" />
          <SummaryBlock
            metricType="conductivity"
            value="68"
            unit="%"
            statusText="Dentro del rango recomendado"
            status="ok"
          />
          <div className="divider" />
          <SummaryBlock
            metricType="radiation"
            value="842"
            unit="lux"
            statusText="Dentro del rango recomendado"
            status="ok"
          />
          <div className="divider" />
          <SummaryBlock
            metricType="ph"
            value="6.2"
            unit="pH"
            statusText="¡Bien! Estado óptimo."
            status="ok"
          />
        </section>

        {/* Chart Grid */}
        <section className="chart-grid">
          <ChartCard
            title="Temperatura"
            metricType="temperature"
            chartLines={[ASSETS.charts.lineA, ASSETS.charts.lineB, ASSETS.charts.lineC]}
          />
          <ChartCard
            title="Humedad"
            metricType="humidity"
            chartLines={[ASSETS.charts.lineB, ASSETS.charts.lineC]}
          />
          <ChartCard
            title="Radiación"
            metricType="radiation"
            chartLines={[ASSETS.charts.lineD]}
          />
        </section>

        {/* Risk Indicators */}
        <section className="risk-section">
          <h3>Alertas y Riesgos Detectados</h3>
          <div className="risk-list">
            <RiskItem label="Cenicilla" severity="medium" />
            <RiskItem label="Estrés Hídrico" severity="low" />
            <RiskItem label="Deficiencia Nutricional" severity="low" />
            <RiskItem label="Plagas/Insectos" severity="low" />
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * RiskItem Component
 * Displays a risk indicator
 */
function RiskItem({ label, severity = 'low' }) {
  return (
    <div className={`risk-item risk-item--${severity}`}>
      <img src={ASSETS.risk.dot} alt="" />
      <span>{label}</span>
    </div>
  );
}
