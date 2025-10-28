import { NavLink } from 'react-router-dom';
import { BatteryCharging, LogOut, Settings, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './SidebarNav.module.scss';

export const SidebarNav = () => {
  const { t } = useTranslation();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log('logout error: ', error);
      // Best effort: ignore network errors and still clear client session
    } finally {
      clearSession();
    }
  };

  const navItems = [
    { to: '/dashboard', icon: Sun, label: t('layout.nav.dashboard') },
    { to: '/settings', icon: Settings, label: t('layout.nav.settings') },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>{t('layout.brand')}</div>
      <nav className={styles.navList}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : undefined]
                .filter(Boolean)
                .join(' ')
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        <LogOut size={16} />
        <span>{t('layout.logout')}</span>
      </button>
      <div className={styles.stationBadge}>
        <BatteryCharging size={16} />
        <span>{t('layout.stationBadge')}</span>
      </div>
    </aside>
  );
};
