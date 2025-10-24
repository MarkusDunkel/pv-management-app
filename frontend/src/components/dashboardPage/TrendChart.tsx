import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  LegendPayload,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/pages/DashboardPage.module.scss';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMemo, useState } from 'react';
import { CustomTooltip } from '../ui/recharts/CustomTooltip';

const TICK_COUNT = 5;

export const TrendChart = () => {
  const { powerflowHistory } = useDashboardStore();
  const { t } = useTranslation();

  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({
    batteryW: true,
    gridW: true,
    loadW: true,
    pvW: true,
    socPercent: true,
  });

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

  const handleLegendClick = (event: LegendPayload) => {
    const { dataKey } = event;

    if (!dataKey) return;

    setActiveKeys((prev) => ({
      ...prev,
      [dataKey as string]: !prev[dataKey as string],
    }));
  };

  const units: Record<string, string> = {};
  Object.keys(activeKeys).forEach((key) => (units[key] = key != 'socPercent' ? 'W' : '%'));

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
                content={<CustomTooltip activeKeys={activeKeys} units={units} />}
                labelFormatter={(label: string) => t('dashboard.tooltipTime', { label })}
                contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
              />

              <Legend onClick={handleLegendClick} />
              <Area
                yAxisId="soc"
                type="monotone"
                dataKey="socPercent"
                name={t('dashboard.series.stateOfCharge')}
                fill="hsl(var(--neutral-400))"
                stroke="hsl(var(--neutral-400))"
                connectNulls
                activeDot={activeKeys.socPercent ? undefined : false}
                strokeWidth={0}
                fillOpacity={activeKeys.socPercent ? 0.5 : 0}
              />

              <Line
                yAxisId="power"
                type="monotone"
                dataKey="pvW"
                name={t('dashboard.series.pv')}
                stroke="hsl(var(--graph-solar))"
                strokeWidth={2}
                dot={false}
                strokeOpacity={activeKeys.pvW ? 1 : 0}
                connectNulls
                activeDot={activeKeys.pvW ? undefined : false}
              />

              <Line
                yAxisId="power"
                type="monotone"
                dataKey="loadW"
                name={t('dashboard.series.load')}
                stroke="hsl(var(--graph-load))"
                strokeWidth={2}
                strokeOpacity={activeKeys.loadW ? 1 : 0}
                dot={false}
                connectNulls
                activeDot={activeKeys.loadW ? undefined : false}
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
                strokeOpacity={activeKeys.gridW ? 1 : 0}
                activeDot={activeKeys.gridW ? undefined : false}
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
                strokeOpacity={activeKeys.batteryW ? 1 : 0}
                activeDot={activeKeys.batteryW ? undefined : false}
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
