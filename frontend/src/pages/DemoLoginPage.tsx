import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './AuthPage.module.scss';
import { authApi } from '@/api/auth';

const DemoLoginPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuthStore((state) => ({
    setSession: state.setSession,
    isAuthenticated: state.isAuthenticated,
  }));
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      navigate('/demo-invalid', { replace: true });
      return () => {
        cancelled = true;
      };
    }

    if (isAuthenticated) {
      return;
    }

    authApi
      .demoLogin(slug)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setSession(data.token, {
          email: data.email,
          displayName: data.displayName,
          roles: data.roles ?? [],
        });
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/demo-invalid', { replace: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, slug, setSession]);

  return (
    <div className={styles.authCard}>
      <h1>{t('demo.login.title')}</h1>
      <p>{t('demo.login.description')}</p>
      <span>{t('demo.login.progress')}</span>
    </div>
  );
};

export default DemoLoginPage;
