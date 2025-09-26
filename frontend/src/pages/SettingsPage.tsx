import { FormEvent, useState } from 'react';
import { userApi } from '@/api/user';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import styles from './SettingsPage.module.scss';

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    try {
      const response = await userApi.updateProfile(displayName);
      if (token) {
        setSession(token, {
          email: response.email,
          displayName: response.displayName,
          roles: response.roles ?? []
        });
      }
      setStatus('saved');
    } catch (error) {
      setStatus('error');
      console.error('Failed to update profile', error);
    }
  };

  return (
    <div className={styles.settingsShell}>
      <section className={`${styles.card} card`}>
        <div className="card-heading">
          <h2>Profile</h2>
          <span className="text-muted">Update how your name appears across the dashboard.</span>
        </div>
        <form onSubmit={handleProfileSubmit} className={styles.formGrid}>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Jane Doe"
            required
          />
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
          {status === 'saved' && <span className={styles.helper}>Profile updated successfully.</span>}
          {status === 'error' && <span className={styles.error}>Unable to update profile right now.</span>}
        </form>
      </section>

      <section className={`${styles.card} card`}>
        <div className="card-heading">
          <h2>SEMS Credentials</h2>
          <span className="text-muted">Configure the credentials that the backend uses to fetch live data.</span>
        </div>
        <div className={styles.infoBox}>
          <p>
            SEMS API credentials are stored securely in the backend via environment variables or Secret Manager. Refer
            to the deployment guide to update them safely.
          </p>
          <ul>
            <li><code>SEMS_ACCOUNT</code> – account email used for SEMS login</li>
            <li><code>SEMS_PASSWORD</code> – application password</li>
            <li><code>SEMS_STATION_ID</code> – identifier for the power station being monitored</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
