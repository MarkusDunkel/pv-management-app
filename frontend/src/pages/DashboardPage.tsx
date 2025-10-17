import { useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { PowerflowPoint, useDashboardStore } from '@/store/dashboardStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { dashboardApi } from '@/api/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from './DashboardPage.module.scss';
import { FlowChart } from '@/components/dashboardPage/FlowChart';

const DEFAULT_POWER_STATION_ID = 1;

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { currentPowerflow, powerflowHistory, isLoading, setLoading } = useDashboardStore();

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

  const powerflowSeries = useMemo(() => {
    if (!powerflowHistory.length) {
      return [];
    }

    return [...powerflowHistory]
      .filter((point) => point.timestamp)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((point) => {
        const date = new Date(point.timestamp);
        return {
          ...point,
          timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
  }, [powerflowHistory]);
  const latestHistoryTime = powerflowSeries.length
    ? new Date(powerflowSeries[powerflowSeries.length - 1].timestamp)
    : null;

  if (isLoading && !currentPowerflow) {
    return <LoadingScreen message="Fetching live solar data..." />;
  }

  return (
    <div className={`dashboard-grid ${styles['dashboard-page__layout']}`}>
      <section className={styles['dashboard-page__hero-card']}>
        <FlowChart currentPowerflow={currentPowerflow as PowerflowPoint} />
        <article className={`${styles['dashboard-page__battery-card']} card`}>
          <div className="card-heading">
            <h3>Battery State of Charge</h3>
            <span className="text-muted">
              Last update •{' '}
              {currentPowerflow?.timestamp
                ? new Date(currentPowerflow.timestamp).toLocaleTimeString()
                : '—'}
            </span>
          </div>
          <div className={styles['dashboard-page__battery-meta']}>
            <span className={styles['dashboard-page__battery-meta-value']}>
              {currentPowerflow?.socPercent ? `${currentPowerflow.socPercent.toFixed(1)}%` : '—'}
            </span>
            <p>
              State of charge reflects the current energy buffer available from your battery bank.
            </p>
          </div>
        </article>
      </section>

      <section className={`${styles['dashboard-page__chart-card']} card`}>
        <div className="card-heading">
          <h3>Power Flow Trend</h3>
          <span className="text-muted">
            {latestHistoryTime
              ? `Last update • ${latestHistoryTime.toLocaleTimeString()}`
              : 'History data will appear once collected'}
          </span>
        </div>
        <div className={styles['dashboard-page__chart-wrapper']}>
          {powerflowSeries.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerflowSeries} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeLabel" minTickGap={24} />
                <YAxis
                  yAxisId="power"
                  tickFormatter={(value) => `${Math.round(value)} W`}
                  width={80}
                />
                <YAxis
                  yAxisId="soc"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${Math.round(value)}%`}
                  width={60}
                  allowDecimals={false}
                  hide={powerflowSeries.every((point) => point.socPercent == null)}
                />
                <Tooltip
                  labelFormatter={(label: string) => `Time • ${label}`}
                  contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                />
                <Legend />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="pvW"
                  name="PV"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="loadW"
                  name="Load"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="gridW"
                  name="Grid"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="batteryW"
                  name="Battery"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="soc"
                  type="monotone"
                  dataKey="socPercent"
                  name="State of Charge"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  hide={powerflowSeries.every((point) => point.socPercent == null)}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">Historical readings are not available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
