import {
  CartesianGrid,
  Legend,
  LegendPayload,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/pages/PanelSizeOptimizerPage.module.scss';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { PanelOptimizationResponse } from '@/api/optimizations';
import { parseTimestamp } from '@/pages/PanelSizeOptimizerPage';
import { CustomLegend } from '../ui/recharts/CustomLegend';
import { CustomTooltip } from '../ui/recharts/CustomTooltip';
import { wattNumberLabel } from '@/lib/formatters';

interface Props {
  data: PanelOptimizationResponse;
  activeIndex: number;
}

export const DiurnalProfile = ({ data, activeIndex }: Props) => {
  const { t } = useTranslation();

  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({
    production: true,
    consumption: true,
  });

  const diurnalChartData = useMemo(() => {
    const consumptionMap = new Map(
      data.diurnalAggregatedConsumption.map((point, index) => [
        point.timestamp,
        { value: point.value, ts: parseTimestamp(point.timestamp, index) },
      ]),
    );
    const productionSeries = data.diurnalAggregatedPvProductions[activeIndex] ?? [];
    const productionMap = new Map(
      productionSeries.map((point, index) => [
        point.timestamp,
        { value: point.value, ts: parseTimestamp(point.timestamp, index) },
      ]),
    );
    const timestamps = Array.from(new Set([...consumptionMap.keys(), ...productionMap.keys()]));

    return timestamps
      .map((timestamp, index) => {
        const consumption = consumptionMap.get(timestamp);
        const production = productionMap.get(timestamp);
        const ts = consumption?.ts ?? production?.ts ?? parseTimestamp(timestamp, index);
        return {
          timestamp,
          time: ts,
          consumption: consumption?.value ?? null,
          production: production?.value ?? null,
        };
      })
      .sort((a, b) => a.time - b.time);
  }, [data, activeIndex]);

  const handleLegendClick = (event: LegendPayload) => {
    const { dataKey } = event;

    if (!dataKey) return;

    setActiveKeys((prev) => ({
      ...prev,
      [dataKey as string]: !prev[dataKey as string],
    }));
  };
  const units: Record<string, string> = {};
  Object.keys(activeKeys).forEach((key) => (units[key] = 'W'));

  return (
    <div className={`${styles['chartCard']} card diurnal-profile-globals`}>
      {diurnalChartData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={diurnalChartData} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--neutral-400)" />
            <XAxis
              dataKey="time"
              tickFormatter={(value: number) =>
                new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
              type="number"
              domain={['auto', 'auto']}
            />
            <YAxis tickFormatter={wattNumberLabel} width={70} />
            <Legend
              content={
                <CustomLegend activeKeys={activeKeys} onLegendItemClick={handleLegendClick} />
              }
            />
            <Tooltip
              content={
                <CustomTooltip
                  activeKeys={activeKeys}
                  units={units}
                  valueFormatter={wattNumberLabel}
                />
              }
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              name={t('optimizer.metrics.consumption')}
              stroke="hsl(var(--graph-load))"
              strokeWidth={2}
              dot={false}
              strokeOpacity={activeKeys.consumption ? 1 : 0}
              activeDot={activeKeys.consumption ? undefined : false}
            />
            <Line
              type="monotone"
              dataKey="production"
              name={t('optimizer.metrics.production')}
              stroke="hsl(var(--graph-solar))"
              strokeWidth={2}
              dot={false}
              strokeOpacity={activeKeys.production ? 1 : 0}
              activeDot={activeKeys.production ? undefined : false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className={styles.emptyState}>{t('optimizer.chart.empty')}</p>
      )}
    </div>
  );
};
