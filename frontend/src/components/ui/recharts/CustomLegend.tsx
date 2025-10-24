import type { LegendPayload } from 'recharts';

import styles from './rechartsComponents.module.scss';

type Props = {
  payload?: LegendPayload[];
  activeKeys: Record<string, boolean>;
  onLegendItemClick?: (item: LegendPayload) => void;
};

export const CustomLegend = ({ payload, activeKeys, onLegendItemClick }: Props) => {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className={styles['legend']}>
      {payload.map((item) => {
        const dataKey = item.dataKey != null ? String(item.dataKey) : undefined;
        const key = dataKey;
        const isActive = dataKey !== undefined ? activeKeys[dataKey] !== false : true;

        return (
          <li
            key={key}
            className={`${styles['legend__item']} ${!isActive ? styles['legend__item--inactive'] : ''}`}
            onClick={() => onLegendItemClick?.(item)}
            role="button"
          >
            <span
              className={styles['legend__icon']}
              style={{ backgroundColor: item.color || '#000' }}
            />
            <span>{(item.value as string | number | undefined) ?? dataKey ?? ''}</span>
          </li>
        );
      })}
    </ul>
  );
};
