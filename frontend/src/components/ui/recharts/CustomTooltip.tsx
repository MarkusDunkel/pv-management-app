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
}

export const CustomTooltip = ({ active, payload, label, activeKeys }: Props) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const filteredPayload = payload.filter((entry) => activeKeys[entry.dataKey]);

  if (filteredPayload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #cbd5f5',
        borderRadius: 12,
        padding: '10px 15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: 14,
        color: '#333',
        minWidth: 120,
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{label}</div>
      {filteredPayload.map(({ dataKey, name, value, color }) => (
        <div key={dataKey} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: color,
              marginRight: 8,
              borderRadius: 2,
            }}
          />
          <div>
            <span>{name}:</span> <span style={{ fontWeight: 'bold' }}>{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
