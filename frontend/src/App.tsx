import { Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { AppRoutes } from './routes';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useTranslation } from './hooks/useTranslation';

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  return (
    <AppLayout isAuthenticated={isAuthenticated}>
      <Suspense fallback={<LoadingScreen message={t('app.loadingDashboard')} />}>
        <AppRoutes />
      </Suspense>
    </AppLayout>
  );
};

export default App;
