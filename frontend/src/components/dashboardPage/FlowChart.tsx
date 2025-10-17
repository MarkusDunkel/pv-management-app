import { cn } from '@/lib/utils';
import styles from '@/pages/DashboardPage.module.scss';
import { PowerflowPoint } from '@/store/dashboardStore';
import { Battery, Dot, Grid3x2, HousePlug, Sun, UtilityPole } from 'lucide-react';
import 'react';

type Props = { currentPowerflow: PowerflowPoint };

export const FlowChart = ({ currentPowerflow }: Props) => {
  const speeds = {
    top: currentPowerflow?.gridW || 0,
    bottom: currentPowerflow?.loadW || 0,
    left: currentPowerflow?.pvW || 0,
    right: currentPowerflow?.batteryW || 0,
  };

  const SCALING_FACTOR = 5000;
  const relativeSpeeds = {
    top: Math.abs(speeds.top / SCALING_FACTOR),
    bottom: Math.abs(speeds.bottom / SCALING_FACTOR),
    left: Math.abs(speeds.left / SCALING_FACTOR),
    right: Math.abs(speeds.right / SCALING_FACTOR),
  };

  const relativeDurations = {
    top: Math.abs(1 / relativeSpeeds.top),
    bottom: Math.abs(1 / relativeSpeeds.bottom),
    left: Math.abs(1 / relativeSpeeds.left),
    right: Math.abs(relativeSpeeds.right === 0 ? 0 : 1 / relativeSpeeds.right),
  };

  console.log('relativeDurations: ', relativeDurations);
  return (
    <div className={styles.flowChart}>
      <div className={styles.flowChart__firstRow}>
        <div
          style={{ '--duration-chevronLeft': `${relativeDurations.left}s` } as React.CSSProperties}
          className={styles.flowChart__upperLeft}
        >
          <UtilityPole className={styles.iconGrid} />
          <Dot strokeWidth={5} className={styles.chevronLeft} />
          <Dot strokeWidth={5} className={styles.chevronLeft} />
          <Dot strokeWidth={5} className={styles.chevronLeft} />
          <div className={styles.flowChart__centerOverlay} />
          <div className={styles.flowChart__valueBoxGrid}>{`${speeds.top} W`}</div>
          <div className={styles.flowChart__valueBoxSolar}>{`${speeds.left} W`}</div>
        </div>
        <div
          style={{ '--duration-chevronTop': `${relativeDurations.top}s` } as React.CSSProperties}
          className={styles.flowChart__upperRight}
        >
          <Battery className={styles.iconBattery} />
          <Dot strokeWidth={5} className={styles.chevronTop} />
          <Dot strokeWidth={5} className={styles.chevronTop} />
          <Dot strokeWidth={5} className={styles.chevronTop} />
        </div>
      </div>
      <div className={styles.flowChart__secondRow}>
        <div
          style={
            { '--duration-chevronBottom': `${relativeDurations.bottom}s` } as React.CSSProperties
          }
          className={styles.flowChart__lowerLeft}
        >
          <div className={cn(styles.iconPv)}>
            <div className={cn(styles.iconPvContainer)}>
              <Sun strokeWidth={2} />
              <Grid3x2 strokeWidth={2} className={cn(styles.iconPvContainer__decorator)} />
            </div>
          </div>
          <Dot strokeWidth={5} className={styles.chevronBottom} />
          <Dot strokeWidth={5} className={styles.chevronBottom} />
          <Dot strokeWidth={5} className={styles.chevronBottom} />
        </div>
        <div
          style={
            { '--duration-chevronRight': `${relativeDurations.right}s` } as React.CSSProperties
          }
          className={styles.flowChart__lowerRight}
        >
          <HousePlug className={styles.iconLoad} />
          {relativeDurations.right !== 0 && (
            <>
              <Dot strokeWidth={5} className={styles.chevronRight} />
              <Dot strokeWidth={5} className={styles.chevronRight} />
              <Dot strokeWidth={5} className={styles.chevronRight} />
            </>
          )}
          <div className={styles.flowChart__valueBoxLoad}>{`${speeds.bottom} W`}</div>
          <div className={styles.flowChart__valueBoxBattery}>{`${speeds.right} W`}</div>
        </div>
      </div>
    </div>
  );
};
