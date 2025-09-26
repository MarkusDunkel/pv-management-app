import { useEffect, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Battery, Leaf, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { dashboardApi } from '@/api/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from './DashboardPage.module.scss';

const DEFAULT_POWER_STATION_ID = 1;

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { currentPowerflow, forecast, isLoading, setLoading } = useDashboardStore();

  useDashboardData(DEFAULT_POWER_STATION_ID);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await dashboardApi.getCurrent(DEFAULT_POWER_STATION_ID);
      } catch (error) {
        console.error('Failed to refresh current measurements', error);
      } finally {
        setLoading(false);
      }
    };

    const interval = window.setInterval(load, 60_000);
    return () => window.clearInterval(interval);
  }, [setLoading]);

  const heroStats = useMemo(
    () => [
      {
        icon: Zap,
        label: 'PV Output',
        value: currentPowerflow?.pvW ? `${currentPowerflow.pvW.toFixed(0)} W` : '—',
        accent: styles.accentSolar
      },
      {
        icon: Battery,
        label: 'Battery Flow',
        value: currentPowerflow?.batteryW ? `${currentPowerflow.batteryW.toFixed(0)} W` : '—',
        accent: styles.accentBattery
      },
      {
        icon: ArrowDownRight,
        label: 'Grid Import',
        value: currentPowerflow?.gridW && currentPowerflow.gridW > 0 ? `${currentPowerflow.gridW.toFixed(0)} W` : '0 W',
        accent: styles.accentGrid
      },
      {
        icon: ArrowUpRight,
        label: 'Load Demand',
        value: currentPowerflow?.loadW ? `${currentPowerflow.loadW.toFixed(0)} W` : '—',
        accent: styles.accentLoad
      }
    ],
    [currentPowerflow]
  );

  if (isLoading && !currentPowerflow) {
    return <LoadingScreen message="Fetching live solar data..." />;
  }

  return (
    <div className="dashboard-grid">
      <section className={styles.heroCard}>
        <div>
          <h2>Hello, {user?.displayName ?? 'Solar Owner'} ☀️</h2>
          <p>Your system is running smoothly. These numbers update automatically every minute.</p>
        </div>
        <div className={styles.statGrid}>
          {heroStats.map((stat) => (
            <article key={stat.label} className={`${styles.statCard} ${stat.accent}`}>
              <stat.icon size={22} />
              <div>
                <span className={styles.statLabel}>{stat.label}</span>
                <strong className={styles.statValue}>{stat.value}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.chartCard} card`}>
        <div className="card-heading">
          <h3>Battery State of Charge</h3>
          <span className="text-muted">Last update • {currentPowerflow?.timestamp ? new Date(currentPowerflow.timestamp).toLocaleTimeString() : '—'}</span>
        </div>
        <div className={styles.socDisplay}>
          <span className={styles.socValue}>{currentPowerflow?.socPercent ? `${currentPowerflow.socPercent.toFixed(1)}%` : '—'}</span>
          <p>State of charge reflects the current energy buffer available from your battery bank.</p>
        </div>
      </section>

      <section className={`${styles.chartCard} card`}>
        <div className="card-heading">
          <h3>Next 3-Day Outlook</h3>
          <span className="text-muted">Powered by SEMS forecast</span>
        </div>
        <div className={styles.forecastGrid}>
          {forecast.slice(0, 3).map((day) => (
            <div key={day.date} className={styles.forecastItem}>
              <span className={styles.forecastDate}>{new Date(day.date).toLocaleDateString()}</span>
              <strong>{day.summary}</strong>
              <span className={styles.forecastTemps}>
                {day.high ? `${Math.round(day.high)}°C` : '—'}
                <span> / </span>
                {day.low ? `${Math.round(day.low)}°C` : '—'}
              </span>
            </div>
          ))}
          {forecast.length === 0 && <p className="text-muted">Forecast data not available yet.</p>}
        </div>
      </section>

      <section className={`${styles.chartCard} card`}>
        <div className="card-heading">
          <h3>Environmental Impact</h3>
          <span className="text-muted">Based on lifetime yield</span>
        </div>
        <div className={styles.impactRow}>
          <Leaf size={48} className={styles.impactIcon} />
          <div>
            <p className={styles.impactHeadline}>Your renewable generation continues to offset CO₂ emissions.</p>
            <p className="text-muted">As historical data accumulates, this card will highlight trees saved, CO₂ avoided, and coal offsets.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
