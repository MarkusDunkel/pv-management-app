import { useAuthStore } from '@/store/authStore';
import styles from './TopBar.module.scss';

export const TopBar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className={styles.topBar}>
      <div>
        <h1>Energy Dashboard</h1>
        <p>Track production, consumption, and environmental impact in real time.</p>
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
