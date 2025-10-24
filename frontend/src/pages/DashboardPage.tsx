import { dashboardApi } from '@/api/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DashboardAccordion } from '@/components/ui/DashboardAccordion';
import { CurrentInfo } from '@/components/dashboardPage/CurrentInfo';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardStore } from '@/store/dashboardStore';
import { useEffect } from 'react';
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

  const accordionItems = [
    {
      value: 'section-1',
      title: t('dashboard.powerFlowPointHeading'),
      content: <CurrentInfo />,
    },
    {
      value: 'section-2',
      title: t('dashboard.powerFlowHeading'),
      content: <TrendChart />,
    },
  ];

  return <DashboardAccordion items={accordionItems} type={'multiple'} />;
};

export default DashboardPage;
