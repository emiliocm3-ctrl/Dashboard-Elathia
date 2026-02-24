import { useTranslation } from 'react-i18next';
import GaugeChart from './GaugeChart';
import { getAvgMetrics, getOverallHealth, getSectorAlerts, parseNumber } from '../../utils/formatters';

function AnimatedCounter({ value, label, icon }) {
  return (
    <div className="hero-stat">
      <span className="hero-stat__icon">{icon}</span>
      <span className="hero-stat__value">{value}</span>
      <span className="hero-stat__label">{label}</span>
    </div>
  );
}

export function UserHero({ sectors = [], lastRefreshed }) {
  const { t } = useTranslation();
  const avgMetrics = getAvgMetrics(sectors);
  const health = getOverallHealth(sectors);
  const totalAlerts = sectors.reduce((sum, s) => sum + getSectorAlerts(s).length, 0);

  const healthLabel = health === 'ok'
    ? t('hero.healthy')
    : health === 'warning'
      ? t('hero.needsAttention')
      : t('hero.critical');
  const healthColor = health === 'ok' ? '#22c55e' : health === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div className="dashboard-hero dashboard-hero--user">
      <div className="hero-header">
        <div>
          <h2 className="hero-title">{t('hero.healthSummary')}</h2>
          <div className="hero-health-badge" style={{ color: healthColor }}>
            <span className="hero-health-dot" style={{ background: healthColor }} />
            {healthLabel}
          </div>
        </div>
        {lastRefreshed && (
          <span className="hero-timestamp">
            {t('dashboard.lastUpdate')}: {new Date(lastRefreshed).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="hero-gauges">
        <GaugeChart
          value={avgMetrics.temp}
          min={0}
          max={50}
          optimalMin={20}
          optimalMax={40}
          unit={t('units.celsius')}
          label={t('hero.avgTemp')}
          size={130}
        />
        <GaugeChart
          value={avgMetrics.hum}
          min={0}
          max={100}
          optimalMin={70}
          optimalMax={80}
          unit={t('units.percent')}
          label={t('hero.avgHumidity')}
          size={130}
        />
        <div className="hero-alert-count" style={{ borderColor: totalAlerts > 0 ? '#f59e0b' : '#e5e7eb' }}>
          <span className="hero-alert-count__number" style={{ color: totalAlerts > 0 ? '#f59e0b' : '#22c55e' }}>
            {totalAlerts}
          </span>
          <span className="hero-alert-count__label">{t('hero.activeAlerts')}</span>
        </div>
      </div>
    </div>
  );
}

export function AdminHero({ overview = [] }) {
  const { t } = useTranslation();
  const totalRanches = overview.reduce((s, tenant) => s + (tenant.ranches?.length || 0), 0);
  const allSectors = overview.flatMap((tn) => tn.ranches?.flatMap((r) => r.sectors || []) || []);
  const totalSectors = allSectors.length;
  const totalAlerts = allSectors.reduce((s, sec) => s + getSectorAlerts(sec).length, 0);
  const temps = allSectors.map((sec) => parseNumber(sec.air_temperature)).filter((v) => v !== null);
  const avgTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

  return (
    <div className="dashboard-hero dashboard-hero--admin">
      <AnimatedCounter value={overview.length} label={t('dashboard.allTenants')} icon="👥" />
      <AnimatedCounter value={totalRanches} label={t('hero.totalRanches')} icon="🏡" />
      <AnimatedCounter value={totalSectors} label={t('hero.totalSectors')} icon="🌱" />
      <AnimatedCounter value={totalAlerts} label={t('hero.activeAlerts')} icon="⚠️" />
      <AnimatedCounter value={`${avgTemp.toFixed(1)}°`} label={t('hero.avgTemp')} icon="🌡️" />
    </div>
  );
}

export default function DashboardHero({ variant = 'user', ...props }) {
  return variant === 'admin' ? <AdminHero {...props} /> : <UserHero {...props} />;
}
