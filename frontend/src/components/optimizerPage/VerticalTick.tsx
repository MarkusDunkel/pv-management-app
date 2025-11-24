export const VerticalTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <text x={x} y={y} dy={3} textAnchor="end" transform={`rotate(-45, ${x}, ${y})`} fontSize={14}>
      {payload.value}
    </text>
  );
};
