import { NavLink } from 'react-router-dom';
import { BatteryCharging, History, LogOut, Settings, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import styles from './SidebarNav.module.scss';

const navItems = [
  { to: '/dashboard', icon: Sun, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export const SidebarNav = () => {
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Best effort: ignore network errors and still clear client session
    } finally {
      clearSession();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>PV Management</div>
      <nav className={styles.navList}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : undefined].filter(Boolean).join(' ')
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        <LogOut size={16} />
        <span>Log out</span>
      </button>
      <div className={styles.stationBadge}>
        <BatteryCharging size={16} />
        <span>Live Solar Data</span>
      </div>
    </aside>
  );
};
