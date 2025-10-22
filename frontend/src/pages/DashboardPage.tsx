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
import { PowerflowPoint, useDashboardStore } from '@/store/dashboardStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { dashboardApi } from '@/api/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from './DashboardPage.module.scss';
import { FlowChart } from '@/components/dashboardPage/FlowChart';
import { Dot } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const DEFAULT_POWER_STATION_ID = 1;

const DashboardPage = () => {
  const { currentPowerflow, powerflowHistory, isLoading, setLoading } = useDashboardStore();
  const { t } = useTranslation();

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
    return <LoadingScreen message={t('dashboard.loadingLiveData')} />;
  }

  const systemStatusTimestamp = currentPowerflow?.timestamp
    ? new Date(currentPowerflow.timestamp).toLocaleString()
    : '—';

  return (
    <div className={`dashboard-grid ${styles['dashboard-page__layout']}`}>
      <section className={styles['dashboard-page__hero-card']}>
        <FlowChart currentPowerflow={currentPowerflow as PowerflowPoint} />
        <article className={`${styles['dashboard-page__battery-card']} card`}>
          <div className="card-heading">
            <h3>{t('dashboard.batteryHeading')}</h3>
            <span className="text-muted">
              {currentPowerflow?.timestamp
                ? new Date(currentPowerflow.timestamp).toLocaleTimeString()
                : '—'}
            </span>
          </div>
          <div className={styles['dashboard-page__battery-meta']}>
            <span className={styles['dashboard-page__battery-meta-value']}>
              {currentPowerflow?.socPercent ? `${currentPowerflow.socPercent.toFixed(1)}%` : '—'}
            </span>
            <p>{t('dashboard.batteryDescription')}</p>
          </div>
        </article>
        <article className={`${styles['dashboard-page__status-card']} card`}>
          <div className={`card-heading`}>
            <span
              className={`${styles['dashboard-page__status-card__heading-unit']} 
              ${styles[currentPowerflow?.socPercent ? 'dashboard-page__status-card--success' : 'dashboard-page__status-card--error']}`}
            >
              <h3>{t('dashboard.systemStatusHeading')}</h3>
              <Dot
                strokeWidth={7}
                // className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--left'])}
              />
            </span>
            <span className="text-muted">
              {currentPowerflow?.timestamp
                ? new Date(currentPowerflow.timestamp).toLocaleTimeString()
                : '—'}
            </span>
          </div>
          <div className={styles['dashboard-page__battery-meta']}>
            <p>{t('dashboard.systemStatusHealthy')}</p>
            <p>{t('dashboard.systemStatusUpdated', { timestamp: systemStatusTimestamp })}</p>
          </div>
        </article>
      </section>

      <section className={`${styles['dashboard-page__chart-card']} card`}>
        <div className="card-heading">
          <h3>{t('dashboard.powerFlowHeading')}</h3>
          <span className="text-muted">
            {latestHistoryTime
              ? t('dashboard.powerFlowUpdated', { time: latestHistoryTime.toLocaleTimeString() })
              : t('dashboard.powerFlowEmpty')}
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
                  labelFormatter={(label: string) => t('dashboard.tooltipTime', { label })}
                  contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                />
                <Legend />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="pvW"
                  name={t('dashboard.series.pv')}
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="loadW"
                  name={t('dashboard.series.load')}
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="gridW"
                  name={t('dashboard.series.grid')}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="batteryW"
                  name={t('dashboard.series.battery')}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="soc"
                  type="monotone"
                  dataKey="socPercent"
                  name={t('dashboard.series.stateOfCharge')}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  hide={powerflowSeries.every((point) => point.socPercent == null)}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">{t('dashboard.powerFlowNoData')}</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
