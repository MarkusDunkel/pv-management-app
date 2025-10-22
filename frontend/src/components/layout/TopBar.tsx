import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './TopBar.module.scss';

export const TopBar = () => {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  return (
    <header className={styles.topBar}>
      <div>
        <h1>{t('topbar.title')}</h1>
        <p>{t('topbar.subtitle')}</p>
      </div>
      {user && (
        <div className={styles.userChip}>
          <span className={styles.avatar}>{user.displayName.charAt(0).toUpperCase()}</span>
          <div>
            <span className={styles.name}>{user.displayName}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </div>
      )}
    </header>
  );
};
