import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/pages/PanelSizeOptimizerPage.module.scss';
import { useMemo } from 'react';
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
      totalAmount: data.totalAmounts[index] ?? null,
    }));
  }, [data]);

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
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <YAxis tickFormatter={(value: number) => value.toLocaleString()} width={70} />
                <Legend
                  content={
                    <CustomLegend activeKeys={{ capacity: true }} onLegendItemClick={() => {}} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  name={t('optimizer.metrics.total')}
                  stroke="hsl(var(--graph-load))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 6 }}
                />
                <ReferenceLine
                  x={performanceSeries[activeIndex].capacity}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      activeKeys={{ totalAmount: true }}
                      units={{ totalAmount: '' }}
                      titleFormatter={(label) => `${label} W`}
                      valueFormatter={(val) => `${Math.round(val)}`}
                    />
                  }
                  contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={`${styles.performanceBar} performance-bar-globals`}>
            {barChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="horizontal"
                  margin={{ top: 12, right: 12, left: 12, bottom: 36 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--neutral-400)"
                    vertical={false}
                  />
                  <YAxis type="number" tickFormatter={(value: number) => value.toLocaleString()} />
                  <XAxis
                    dataKey="label"
                    type="category"
                    width={10}
                    tick={<VerticalTick />}
                    interval={0}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        units={''}
                        titleFormatter={(label) => `${label}`}
                        valueFormatter={(val) => `${Math.round(val)}`}
                      />
                    }
                    contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                  />
                  <ReferenceLine y={0} stroke="#888" strokeWidth={1} />
                  <Bar dataKey="value" radius={10} barSize={15}>
                    {barChartData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className={styles.emptyState}>{t('optimizer.chart.empty')}</p>
            )}
          </div>
        </div>
      ) : (
        <p className={styles.emptyState}>{t('optimizer.chart.empty')}</p>
      )}
    </div>
  );
};
