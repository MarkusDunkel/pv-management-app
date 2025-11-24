import {
  optimizationApi,
  type PanelOptimizationRequest,
  type PanelOptimizationResponse,
} from '@/api/optimizations';
import { TopBar } from '@/components/layout/TopBar';
import { DiurnalProfile } from '@/components/optimizerPage/DiurnalProfile';
import { Parameters } from '@/components/optimizerPage/Parameters';
import { PerformanceChart } from '@/components/optimizerPage/PerformanceChart';
import { DashboardAccordion } from '@/components/ui/DashboardAccordion';
import { Slider } from '@/components/ui/shadcn/slider';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import styles from './PanelSizeOptimizerPage.module.scss';

const DEFAULT_POWER_STATION_ID = 1;

const DEFAULT_FORM: Record<keyof PanelOptimizationRequest, string> = {
  electricityCosts: '0.36',
  electricitySellingPrice: '0.10',
  currentCapacity: '7000',
  performanceRatio: '0.8',
  reininvesttime: '25',
  panelcost: '1.6',
};

export const parseTimestamp = (timestamp: string, index: number): number => {
  const parsed = Date.parse(timestamp);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const normalized = Date.parse(`1970-01-01T${timestamp.replace('Z', '')}Z`);
  if (!Number.isNaN(normalized)) {
    return normalized + index;
  }

  return Date.now() + index;
};

const toPayload = (
  values: Record<keyof PanelOptimizationRequest, string>,
): PanelOptimizationRequest => ({
  electricityCosts: Number(values.electricityCosts) || 0,
  electricitySellingPrice: Number(values.electricitySellingPrice) || 0,
  currentCapacity: Number(values.currentCapacity) || 0,
  performanceRatio: Number(values.performanceRatio) || 0,
  reininvesttime: Number(values.reininvesttime) || 0,
  panelcost: Number(values.panelcost) || 0,
});

const PanelSizeOptimizerPage = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<PanelOptimizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const current = Number(formValues.currentCapacity);
  const currentIndex = result?.pvCapacities.reduce(
    (acc, val, index) => {
      const diff = Math.abs(val - current);

      if (diff < acc.minValue) {
        return { minValue: diff, minIndex: index };
      }
      return acc;
    },
    { minValue: Infinity, minIndex: -1 },
  ).minIndex;

  const [selectedIndex, setSelectedIndex] = useState(currentIndex || 0);

  useEffect(() => {
    if (!currentIndex) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex(currentIndex);
  }, [currentIndex]);

  const handleRun = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await optimizationApi.run(DEFAULT_POWER_STATION_ID, toPayload(formValues));
      setResult(data);
      setSelectedIndex(0);
    } catch (runError) {
      console.error('Failed to run optimization', runError);
      setError(t('optimizer.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleRun();
  }, []);

  const sliderMax = result ? Math.max(result.pvCapacities.length - 1, 0) : 0;

  const sliderDisabled = !result || result.pvCapacities.length <= 1;

  const accordionItems = [
    {
      value: 'diurnal',
      title: t('optimizer.accordion.diurnal'),
      content: result ? <DiurnalProfile data={result} activeIndex={selectedIndex} /> : null,
    },
    {
      value: 'performance',
      title: t('optimizer.accordion.performance'),
      content: result ? <PerformanceChart data={result} activeIndex={selectedIndex} /> : null,
    },
  ];

  return (
    <div className={'optimizer-page-globals'}>
      <TopBar title={t('optimizer.title')} subTitle={t('optimizer.subtitle')} />
      <div className={styles.layout}>
        <section className={`${styles.parametersCard} card`}>
          <Parameters
            formValues={formValues}
            setFormValues={setFormValues}
            onSubmit={() => {
              handleRun();
            }}
            error={error}
            isLoading={isLoading}
          />
        </section>

        <div className={styles.mainColumn}>
          <section className={`${styles.sliderCard}`}>
            <div className={`${styles.sliderCard__headingContainer}`}>
              <div>
                <h2>{t('optimizer.slider.heading')}</h2>
                <p className="text-muted">{t('optimizer.slider.helper')}</p>
              </div>
              <div className={styles.sliderCard__number}>
                <span>{result?.pvCapacities[selectedIndex] + ' W'}</span>
              </div>
            </div>
            <div className={styles.sliderRow}>
              <Slider
                value={[selectedIndex || 0]}
                onValueChange={(value) => setSelectedIndex(value[0])}
                min={0}
                max={sliderMax}
                step={1}
                disabled={sliderDisabled}
              />
            </div>
          </section>

          <section>
            <DashboardAccordion
              items={accordionItems}
              type="multiple"
              className={styles.accordionRoot}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default PanelSizeOptimizerPage;
