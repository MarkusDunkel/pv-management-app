import { toDateTimeString } from '@/components/date-utils';
import styles from './rechartsComponents.module.scss';

interface PayloadItem {
  dataKey: string;
  name: string;
  value: number;
  color?: string;
}

interface Props {
  active?: boolean | undefined;
  payload?: PayloadItem[];
  label?: string;
  activeKeys?: Record<string, boolean>;
  units: Record<string, string> | string;
  titleFormatter?: (title: string | number) => string;
  valueFormatter?: (val: number) => string;
}

export const CustomTooltip = ({
  active,
  payload,
  label,
  activeKeys,
  units,
  titleFormatter,
  valueFormatter = (val) => `${val}`,
}: Props) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const filteredPayload = activeKeys
    ? payload.filter((entry) => activeKeys[entry.dataKey])
    : payload;

  if (filteredPayload.length === 0) {
    return null;
  }

  const orderedNames = filteredPayload.map(({ name }) => name).sort();

  const orderedPayload = orderedNames.map((it) =>
    filteredPayload.find(({ name }) => name == it),
  ) as Array<PayloadItem & Record<string, any>>;

  return (
    <div className={styles['minimalTooltip']}>
      <div className={styles['minimalTooltip__label']}>
        {titleFormatter ? titleFormatter(label || '') : toDateTimeString(new Date(label || ''))}
      </div>
      {orderedPayload
        .filter((v) => !!v)
        .map(({ dataKey, name, value, color, ...rest }) => (
          <div key={dataKey} className={styles['minimalTooltip__labelIconCt']}>
            <div
              className={styles['minimalTooltip__Icon']}
              style={{
                backgroundColor: color || rest.payload?.color || 'white',
              }}
            />
            <div>
              <span>{name}: </span>
              <span
                className={styles['minimalTooltip__value']}
              >{`${valueFormatter(value)} ${typeof units === 'string' ? units : units[dataKey]}`}</span>
            </div>
          </div>
        ))}
    </div>
  );
};
