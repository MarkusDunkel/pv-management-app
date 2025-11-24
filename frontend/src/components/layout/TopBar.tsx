import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './TopBar.module.scss';

interface Props {
  title: string;
  subTitle: string;
}

export const TopBar = ({ title, subTitle }: Props) => {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  return (
    <header className={styles.topBar}>
      <div>
        <h1>{title}</h1>
        <p>{subTitle}</p>
      </div>
      {user && (
        <div className={styles.userChip}>
          <span className={styles.avatar}>{user.displayName.charAt(0).toUpperCase()}</span>
          <div>
            <span className={styles.name}>{user.displayName}</span>
            <span className={styles.email}>
              {user.roles.includes('ROLE_DEMO') ? t('topbar.demoAccount') : user.email}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
