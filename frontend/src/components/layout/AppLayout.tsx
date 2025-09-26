import { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import styles from './AppLayout.module.scss';

interface Props {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const AppLayout = ({ children, isAuthenticated }: Props) => {
  if (!isAuthenticated) {
    return <div className={styles.publicShell}>{children}</div>;
  }

  return (
    <div className={styles.appShell}>
      <SidebarNav />
      <div className={styles.mainContent}>
        <TopBar />
        <main className={styles.mainArea}>{children}</main>
      </div>
    </div>
  );
};
