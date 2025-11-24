import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DashboardAccordion } from '@/components/ui/DashboardAccordion';
import { CurrentInfo } from '@/components/dashboardPage/CurrentInfo';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardStore } from '@/store/dashboardStore';
import { TrendChart } from '@/components/dashboardPage/TrendChart';
import { TopBar } from '@/components/layout/TopBar';

const DEFAULT_POWER_STATION_ID = 1;

const DashboardPage = () => {
  const { currentPowerflow, isLoading, setLoading } = useDashboardStore();
  const { t } = useTranslation();

  useDashboardData(DEFAULT_POWER_STATION_ID);

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

  return (
    <div className={'dashboard-page-globals'}>
      <TopBar title={t('dashboard.title')} subTitle={t('dashboard.subtitle')} />
      <DashboardAccordion items={accordionItems} type={'multiple'} />
    </div>
  );
};

export default DashboardPage;
