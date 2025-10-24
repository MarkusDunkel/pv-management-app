import { dashboardApi } from '@/api/dashboard';
import { FlowChart } from '@/components/dashboardPage/FlowChart';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DashboardAccordion } from '@/components/ui/DashboardAccordion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTranslation } from '@/hooks/useTranslation';
import { PowerflowPoint, useDashboardStore } from '@/store/dashboardStore';
import { Dot } from 'lucide-react';
import { useEffect } from 'react';
import styles from './DashboardPage.module.scss';
import { TrendChart } from '@/components/dashboardPage/TrendChart';

const DEFAULT_POWER_STATION_ID = 1;

const DashboardPage = () => {
  const { currentPowerflow, isLoading, setLoading } = useDashboardStore();
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

  if (isLoading && !currentPowerflow) {
    return <LoadingScreen message={t('dashboard.loadingLiveData')} />;
  }

  const systemStatusTimestamp = currentPowerflow?.timestamp
    ? new Date(currentPowerflow.timestamp).toLocaleString()
    : '—';

  const accordionItems = [
    {
      value: 'section-1',
      title: t('dashboard.powerFlowPointHeading'),
      content: (
        <section className={styles['dashboard-page__hero-card']}>
          <div className={'card'}>
            <FlowChart currentPowerflow={currentPowerflow as PowerflowPoint} />
          </div>
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
                <Dot strokeWidth={7} />
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
      ),
    },
    {
      value: 'section-2',
      title: t('dashboard.powerFlowHeading'),
      content: <TrendChart />,
    },
  ];

  return (
    <div className={`dashboard-grid ${styles['dashboard-page__layout']}`}>
      <DashboardAccordion items={accordionItems} type={'multiple'} />
    </div>
  );
};

export default DashboardPage;
