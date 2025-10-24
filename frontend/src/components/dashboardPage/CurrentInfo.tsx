import { FlowChart } from './FlowChart';
import styles from '@/pages/DashboardPage.module.scss';
import { Dot } from 'lucide-react';
import { PowerflowPoint, useDashboardStore } from '@/store/dashboardStore';
import { useTranslation } from '@/hooks/useTranslation';

export const CurrentInfo = () => {
  const { t } = useTranslation();
  const { currentPowerflow } = useDashboardStore();

  const lastUpdatedTime = currentPowerflow?.timestamp
    ? new Date(currentPowerflow.timestamp).toLocaleTimeString()
    : '—';

  const systemStatusTimestamp = currentPowerflow?.timestamp
    ? new Date(currentPowerflow.timestamp).toLocaleString()
    : '—';

  const socPercent = currentPowerflow?.socPercent
    ? `${currentPowerflow.socPercent.toFixed(1)}%`
    : '—';

  return (
    <section className={styles['dashboard-page__hero-card']}>
      <div className={`${styles['dashboard-page__flow-chart-card']} card`}>
        <FlowChart currentPowerflow={currentPowerflow as PowerflowPoint} />
      </div>
      <article className={`${styles['dashboard-page__battery-card']} card`}>
        <div className="card-heading">
          <h3>{t('dashboard.batteryHeading')}</h3>
          <span className="text-muted">{lastUpdatedTime}</span>
        </div>
        <div className={styles['dashboard-page__battery-meta']}>
          <span className={styles['dashboard-page__battery-meta-value']}>{socPercent}</span>
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
          <span className="text-muted">{lastUpdatedTime}</span>
        </div>
        <div className={styles['dashboard-page__battery-meta']}>
          <p>{t('dashboard.systemStatusHealthy')}</p>
          <p>{t('dashboard.systemStatusUpdated', { timestamp: systemStatusTimestamp })}</p>
        </div>
      </article>
    </section>
  );
};
