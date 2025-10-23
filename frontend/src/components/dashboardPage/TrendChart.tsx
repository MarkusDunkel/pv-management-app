import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/pages/DashboardPage.module.scss';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMemo } from 'react';

const TICK_COUNT = 5;

export const TrendChart = () => {
  const { powerflowHistory } = useDashboardStore();
  const { t } = useTranslation();

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

  return (
    <section className={styles['dashboard-page__chart-card']}>
      <div className={`${styles['dashboard-page__chart-wrapper']} card`}>
        {powerflowSeries.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={powerflowSeries}
              margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="grey" yAxisId="power" />
              <XAxis dataKey="timeLabel" minTickGap={24} />
              <YAxis
                yAxisId="power"
                tickFormatter={(value) => `${Math.round(value)} W`}
                width={80}
                tickCount={TICK_COUNT}
              />
              <YAxis
                yAxisId="soc"
                orientation="right"
                domain={[0, (dataMax) => Math.ceil(dataMax / (TICK_COUNT - 1)) * (TICK_COUNT - 1)]}
                tickFormatter={(value) => `${Math.round(value)}%`}
                tickCount={TICK_COUNT}
                width={60}
                allowDecimals={false}
                hide={powerflowSeries.every((point) => point.socPercent == null)}
              />
              <Tooltip
                labelFormatter={(label: string) => t('dashboard.tooltipTime', { label })}
                contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
              />
              <Legend />
              <Area
                yAxisId="soc"
                type="monotone"
                dataKey="socPercent"
                name={t('dashboard.series.stateOfCharge')}
                fill="hsl(var(--neutral-400))"
                fillOpacity={0.5}
                connectNulls
                strokeWidth={0}
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="pvW"
                name={t('dashboard.series.pv')}
                stroke="hsl(var(--graph-solar))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="loadW"
                name={t('dashboard.series.load')}
                stroke="hsl(var(--graph-load))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="gridW"
                name={t('dashboard.series.grid')}
                stroke="hsl(var(--graph-grid))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="batteryW"
                name={t('dashboard.series.battery')}
                stroke="hsl(var(--graph-battery))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">{t('dashboard.powerFlowNoData')}</p>
        )}
      </div>
    </section>
  );
};
