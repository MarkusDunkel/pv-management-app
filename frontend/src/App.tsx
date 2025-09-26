import { Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { AppRoutes } from './routes';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <AppLayout isAuthenticated={isAuthenticated}>
      <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
        <AppRoutes />
      </Suspense>
    </AppLayout>
  );
};

export default App;
