import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import styles from './AuthPage.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

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
      <h1>Create account</h1>
      <p>Get started with the PV management platform.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />

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
          {status === 'loading' ? 'Creating account…' : 'Register'}
        </Button>
        {status === 'error' && <span className={styles.error}>Unable to register, please try again.</span>}
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
