import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './AuthPage.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await authApi.register(email, password, displayName);
      setSession(response.token, {
        email: response.email,
        displayName: response.displayName,
        roles: response.roles
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed', error);
      setStatus('error');
    }
  };

  return (
    <div className={styles.authCard}>
      <h1>{t('auth.register.title')}</h1>
      <p>{t('auth.register.subtitle')}</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="displayName">{t('auth.form.displayName')}</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />

        <label htmlFor="email">{t('auth.form.email')}</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

        <label htmlFor="password">{t('auth.form.password')}</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
        {status === 'error' && <span className={styles.error}>{t('auth.register.error')}</span>}
      </form>
      <p>
        {t('auth.register.loginPrompt')}{' '}
        <Link to="/login">{t('auth.register.loginLink')}</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
