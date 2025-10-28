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
import { useDashboardStore, type PowerflowPoint } from '@/store/dashboardStore';
import { useEffect, useMemo, useState } from 'react';
import { endOfDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { DatePicker } from '@/components/ui/shadcn/date-picker';
import { CustomTooltip } from '../ui/recharts/CustomTooltip';
import { CustomLegend } from '../ui/recharts/CustomLegend';

const TICK_COUNT = 5;

type PowerflowSeriesPoint = PowerflowPoint & { timeLabel: string };

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

  const powerflowSeries = useMemo<PowerflowSeriesPoint[]>(() => {
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

  const chartRange = useMemo(() => {
    if (!powerflowSeries.length) {
      return { from: undefined, to: undefined };
    }

    const first = new Date(powerflowSeries[0].timestamp);
    const last = new Date(powerflowSeries[powerflowSeries.length - 1].timestamp);

    return {
      from: startOfDay(first),
      to: startOfDay(last),
    };
  }, [powerflowSeries]);

  const [fromDate, setFromDate] = useState<Date | undefined>(chartRange.from);
  const [toDate, setToDate] = useState<Date | undefined>(chartRange.to);

  useEffect(() => {
    if (!chartRange.from || !chartRange.to) {
      setFromDate(undefined);
      setToDate(undefined);
      return;
    }

    setFromDate((prev) => {
      if (!prev) return chartRange.from;
      if (isBefore(prev, chartRange.from) || isAfter(prev, chartRange.to)) {
        return chartRange.from;
      }
      return prev;
    });

    setToDate((prev) => {
      if (!prev) return chartRange.to;
      if (isAfter(prev, chartRange.to) || isBefore(prev, chartRange.from)) {
        return chartRange.to;
      }
      return prev;
    });
  }, [chartRange.from, chartRange.to]);

  const handleFromDateChange = (date?: Date) => {
    if (!date) return;
    const normalized = startOfDay(date);
    setFromDate(normalized);
    setToDate((prev) => {
      if (!prev || isBefore(prev, normalized)) {
        return normalized;
      }
      return prev;
    });
  };

  const handleToDateChange = (date?: Date) => {
    if (!date) return;
    const normalized = startOfDay(date);
    setToDate(normalized);
    setFromDate((prev) => {
      if (!prev || isAfter(prev, normalized)) {
        return normalized;
      }
      return prev;
    });
  };

  const filteredSeries = useMemo(() => {
    if (!powerflowSeries.length) return [] as PowerflowSeriesPoint[];

    const fromBoundary = fromDate ? startOfDay(fromDate).getTime() : null;
    const toBoundary = toDate ? endOfDay(toDate).getTime() : null;

    return powerflowSeries.filter((point) => {
      const timestamp = new Date(point.timestamp).getTime();
      if (fromBoundary !== null && timestamp < fromBoundary) {
        return false;
      }
      if (toBoundary !== null && timestamp > toBoundary) {
        return false;
      }
      return true;
    });
  }, [fromDate, toDate, powerflowSeries]);

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

  const hasSeriesData = filteredSeries.length > 0;

  return (
    <section className={styles['dashboard-page__chart-card']}>
      <div className={`${styles['dashboard-page__chart-wrapper']} card`}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <DatePicker
              label={t('dashboard.powerFlowRangeFrom')}
              date={fromDate}
              onDateChange={handleFromDateChange}
              minDate={chartRange.from}
              maxDate={chartRange.to}
              disabled={!chartRange.from}
            />
            <DatePicker
              label={t('dashboard.powerFlowRangeTo')}
              date={toDate}
              onDateChange={handleToDateChange}
              minDate={chartRange.from}
              maxDate={chartRange.to}
              disabled={!chartRange.to}
            />
          </div>

          <div className="flex-1">
            {hasSeriesData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={filteredSeries}
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
                    hide={filteredSeries.every((point) => point.socPercent == null)}
                  />
                  <Tooltip
                    content={<CustomTooltip activeKeys={activeKeys} units={units} />}
                    labelFormatter={(label: string) => t('dashboard.tooltipTime', { label })}
                    contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                  />

                  <Legend
                    content={
                      <CustomLegend
                        activeKeys={activeKeys}
                        onLegendItemClick={handleLegendClick}
                      />
                    }
                  />
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
        </div>
      </div>
    </section>
  );
};
