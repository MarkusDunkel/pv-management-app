import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  LegendPayload,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/pages/PanelSizeOptimizerPage.module.scss';
import { useMemo, useState } from 'react';
import { PanelOptimizationResponse } from '@/api/optimizations';
import { useTranslation } from '@/hooks/useTranslation';
import { VerticalTick } from './VerticalTick';
import { CustomTooltip } from '../ui/recharts/CustomTooltip';
import { CustomLegend } from '../ui/recharts/CustomLegend';

interface Props {
  data: PanelOptimizationResponse;
  activeIndex: number;
}

export const PerformanceChart = ({ data, activeIndex }: Props) => {
  const { t } = useTranslation();

  const performanceSeries = useMemo(() => {
    if (!data) return [];
    return data.pvCapacities.map((capacity, index) => ({
      capacity,
      index,
      total: data.totalAmounts[index] ?? null,
      lack: data.lackAmounts[index] ?? null,
      fit: data.fitAmounts[index] ?? null,
      excess: data.excessAmounts[index] ?? null,
    }));
  }, [data]);

  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({
    total: true,
    excess: true,
    lack: true,
    fit: true,
  });

  const selectedPerformance = useMemo(() => {
    if (!data || !data.pvCapacities.length) return null;
    return {
      capacity: data.pvCapacities[activeIndex],
      fit: data.fitAmounts[activeIndex] ?? null,
      excess: data.excessAmounts[activeIndex] ?? null,
      lack: data.lackAmounts[activeIndex] ?? null,
      total: data.totalAmounts[activeIndex] ?? null,
    };
  }, [data, activeIndex]);

  const barChartData = useMemo(() => {
    if (!selectedPerformance) return [];
    return [
      {
        label: t('optimizer.metrics.fit'),
        value: selectedPerformance.fit ?? 0,
        color: 'hsl(var(--graph-battery))',
      },
      {
        label: t('optimizer.metrics.excess'),
        value: selectedPerformance.excess ?? 0,
        color: 'hsl(var(--graph-load))',
      },
      {
        label: t('optimizer.metrics.lack'),
        value: selectedPerformance.lack ?? 0,
        color: 'hsl(var(--imperial-red))',
      },
    ];
  }, [selectedPerformance, t]);

  const handleLegendClick = (event: LegendPayload) => {
    const { dataKey } = event;

    if (!dataKey) return;

    setActiveKeys((prev) => ({
      ...prev,
      [dataKey as string]: !prev[dataKey as string],
    }));
  };

  return (
    <div className={`${styles['chartCard']} card`}>
      {performanceSeries.length && selectedPerformance ? (
        <div className={styles.performanceCharts}>
          <div className={`${styles.performanceLine} performance-chart-globals`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceSeries}
                margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--neutral-400)" />
                <XAxis
                  dataKey="capacity"
                  tickFormatter={(value: number) => value.toFixed(0) + ' kWp'}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  // label={
                  //   <Label
                  //     value={t('optimizer.performanceGraph.desc')}
                  //     position="bottom"
                  //     style={{
                  //       fontSize: 12,
                  //       fontWeight: 400,
                  //     }}
                  //   />
                  // }
                />
                <YAxis tickFormatter={(value: number) => value.toFixed(0) + ' €'} width={70} />
                <Legend
                  content={
                    <CustomLegend activeKeys={activeKeys} onLegendItemClick={handleLegendClick} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name={t('optimizer.metrics.total')}
                  stroke="hsl(var(--graph-load))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  strokeOpacity={activeKeys.total ? 1 : 0}
                  activeDot={activeKeys.total ? undefined : false}
                />
                <Line
                  type="monotone"
                  dataKey="fit"
                  name={t('optimizer.metrics.fit')}
                  stroke="hsl(var(--graph-battery))"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  strokeOpacity={activeKeys.fit ? 1 : 0}
                  activeDot={activeKeys.fit ? undefined : false}
                />
                <Line
                  type="monotone"
                  dataKey="excess"
                  name={t('optimizer.metrics.excess')}
                  stroke="hsl(var(--graph-solar))"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  strokeOpacity={activeKeys.excess ? 1 : 0}
                  activeDot={activeKeys.excess ? undefined : false}
                />
                <Line
                  type="monotone"
                  dataKey="lack"
                  name={t('optimizer.metrics.lack')}
                  stroke="hsl(var(--graph-grid))"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  strokeOpacity={activeKeys.lack ? 1 : 0}
                  activeDot={activeKeys.lack ? undefined : false}
                />
                <ReferenceLine
                  x={performanceSeries[activeIndex].capacity}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      activeKeys={activeKeys}
                      units={'€'}
                      titleFormatter={(val) => `${typeof val === 'number' ? val.toFixed(2) : ''} W`}
                      valueFormatter={(val) => val.toFixed(2)}
                    />
                  }
                  contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className={styles.emptyState}>{t('optimizer.chart.empty')}</p>
      )}
    </div>
  );
};
