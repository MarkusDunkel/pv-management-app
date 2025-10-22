import { FormEvent, useState } from 'react';
import { userApi } from '@/api/user';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/i18n/config';
import styles from './SettingsPage.module.scss';

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const { t, language, setLanguage } = useTranslation();

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
          roles: response.roles ?? [],
        });
      }
      setStatus('saved');
    } catch (error) {
      setStatus('error');
      console.error('Failed to update profile', error);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <div className={styles.settingsShell}>
      <section className={`${styles.card} card`}>
        <div className="card-heading">
          <h2>{t('settings.profile.heading')}</h2>
          <span className="text-muted">{t('settings.profile.description')}</span>
        </div>
        <form onSubmit={handleProfileSubmit} className={styles.formGrid}>
          <label htmlFor="displayName">{t('settings.profile.displayName')}</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={t('settings.profile.displayNamePlaceholder')}
            required
          />
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? t('settings.profile.saving') : t('settings.profile.save')}
          </Button>
          {status === 'saved' && (
            <span className={styles.helper}>{t('settings.profile.success')}</span>
          )}
          {status === 'error' && (
            <span className={styles.error}>{t('settings.profile.error')}</span>
          )}
        </form>
      </section>

      <section className={`${styles.card} card`}>
        <div className="card-heading">
          <h2>{t('settings.language.heading')}</h2>
          <span className="text-muted">{t('settings.language.description')}</span>
        </div>
        <div className={styles.formGrid}>
          <label htmlFor="language-select">{t('settings.language.heading')}</label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('settings.language.english')}</SelectItem>
              <SelectItem value="de">{t('settings.language.german')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className={`${styles.card} card`}>
        <div className="card-heading">
          <h2>{t('settings.credentials.heading')}</h2>
          <span className="text-muted">{t('settings.credentials.description')}</span>
        </div>
        <div className={styles.infoBox}>
          <p>{t('settings.credentials.info')}</p>
          <ul>
            <li>
              <code>SEMS_ACCOUNT</code> – {t('settings.credentials.account')}
            </li>
            <li>
              <code>SEMS_PASSWORD</code> – {t('settings.credentials.password')}
            </li>
            <li>
              <code>SEMS_STATION_ID</code> – {t('settings.credentials.stationId')}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
