import { FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import styles from './AuthPage.module.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
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
        roles: response.roles
      });
      const to = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
      navigate(to, { replace: true });
    } catch (error) {
      console.error('Login failed', error);
      setStatus('error');
    }
  };

  return (
    <div className={styles.authCard}>
      <h1>Welcome back</h1>
      <p>Monitor your photovoltaic system anywhere, anytime.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </Button>
        {status === 'error' && <span className={styles.error}>Invalid credentials, please try again.</span>}
      </form>
      <p>
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
};

export default LoginPage;
