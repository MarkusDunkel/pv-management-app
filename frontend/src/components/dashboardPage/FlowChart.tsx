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
    <div className={styles['flow-chart']}>
      <div className={styles['flow-chart__row']}>
        <div
          style={{ '--duration-chevronLeft': `${relativeDurations.left}s` } as React.CSSProperties}
          className={cn(
            styles['flow-chart__segment'],
            styles['flow-chart__segment--upper-left'],
          )}
        >
          <UtilityPole
            className={cn(styles['flow-chart__icon'], styles['flow-chart__icon--grid'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--left'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--left'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--left'])}
          />
          <div className={styles['flow-chart__center-overlay']} />
          <div className={cn(styles['flow-chart__value-box'], styles['flow-chart__value-box--grid'])}>
            {`${speeds.top} W`}
          </div>
          <div className={cn(styles['flow-chart__value-box'], styles['flow-chart__value-box--solar'])}>
            {`${speeds.left} W`}
          </div>
        </div>
        <div
          style={{ '--duration-chevronTop': `${relativeDurations.top}s` } as React.CSSProperties}
          className={cn(
            styles['flow-chart__segment'],
            styles['flow-chart__segment--upper-right'],
          )}
        >
          <Battery
            className={cn(styles['flow-chart__icon'], styles['flow-chart__icon--battery'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--top'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--top'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--top'])}
          />
        </div>
      </div>
      <div className={styles['flow-chart__row']}>
        <div
          style={
            { '--duration-chevronBottom': `${relativeDurations.bottom}s` } as React.CSSProperties
          }
          className={cn(
            styles['flow-chart__segment'],
            styles['flow-chart__segment--lower-left'],
          )}
        >
          <div className={cn(styles['flow-chart__icon'], styles['flow-chart__icon--pv'])}>
            <div className={styles['flow-chart__icon-wrapper']}>
              <Sun strokeWidth={2} />
              <Grid3x2
                strokeWidth={2}
                className={styles['flow-chart__icon-decorator']}
              />
            </div>
          </div>
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--bottom'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--bottom'])}
          />
          <Dot
            strokeWidth={5}
            className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--bottom'])}
          />
        </div>
        <div
          style={
            { '--duration-chevronRight': `${relativeDurations.right}s` } as React.CSSProperties
          }
          className={cn(
            styles['flow-chart__segment'],
            styles['flow-chart__segment--lower-right'],
          )}
        >
          <HousePlug
            className={cn(styles['flow-chart__icon'], styles['flow-chart__icon--load'])}
          />
          {relativeDurations.right !== 0 && (
            <>
              <Dot
                strokeWidth={5}
                className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--right'])}
              />
              <Dot
                strokeWidth={5}
                className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--right'])}
              />
              <Dot
                strokeWidth={5}
                className={cn(styles['flow-chart__chevron'], styles['flow-chart__chevron--right'])}
              />
            </>
          )}
          <div className={cn(styles['flow-chart__value-box'], styles['flow-chart__value-box--load'])}>
            {`${speeds.bottom} W`}
          </div>
          <div className={cn(styles['flow-chart__value-box'], styles['flow-chart__value-box--battery'])}>
            {`${speeds.right} W`}
          </div>
        </div>
      </div>
    </div>
  );
};
