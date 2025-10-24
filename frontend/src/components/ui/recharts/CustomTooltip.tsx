import styles from './rechartsComponents.module.scss';

interface PayloadItem {
  dataKey: string;
  name: string;
  value: number | string;
  color?: string;
}

interface Props {
  active?: boolean | undefined;
  payload?: PayloadItem[];
  label?: string | number;
  activeKeys: Record<string, boolean>;
  units: Record<string, string>;
}

export const CustomTooltip = ({ active, payload, label, activeKeys, units }: Props) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const filteredPayload = payload.filter((entry) => activeKeys[entry.dataKey]);

  if (filteredPayload.length === 0) {
    return null;
  }

  const orderedNames = filteredPayload.map(({ name }) => name).sort();

  const orderedPayload = orderedNames.map((it) => filteredPayload.find(({ name }) => name == it));

  return (
    <div className={styles['minimalTooltip']}>
      <div className={styles['minimalTooltip__label']}>{label}</div>
      {orderedPayload
        .filter((v) => !!v)
        .map(({ dataKey, name, value, color }) => (
          <div key={dataKey} className={styles['minimalTooltip__labelIconCt']}>
            <div
              className={styles['minimalTooltip__Icon']}
              style={{
                backgroundColor: color,
              }}
            />
            <div>
              <span>{name}: </span>
              <span
                className={styles['minimalTooltip__value']}
              >{`${value} ${units[dataKey]}`}</span>
            </div>
          </div>
        ))}
    </div>
  );
};
