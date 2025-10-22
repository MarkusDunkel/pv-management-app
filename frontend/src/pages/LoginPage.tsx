import { FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './AuthPage.module.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await authApi.login(email, password);
      setSession(response.token, {
        email: response.email,
        displayName: response.displayName,
        roles: response.roles,
      });
      const to =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
      navigate(to, { replace: true });
    } catch (error) {
      console.error('Login failed', error);
      setStatus('error');
    }
  };

  return (
    <div className={styles.authCard}>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.subtitle')}</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email">{t('auth.form.email')}</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">{t('auth.form.password')}</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
        {status === 'error' && <span className={styles.error}>{t('auth.login.error')}</span>}
      </form>
      <p>
        {t('auth.login.registerPrompt')}
        <Link to="/register">{t('auth.login.registerLink')}</Link>
      </p>
    </div>
  );
};

export default LoginPage;
