function formatCompactCurrency(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }

  return String(Math.round(value));
}

export default function SimpleLineChart({ data, height = 260 }) {
  const width = 760;
  const padding = 32;
  const maxValue = Math.max(...data.map((item) => item.revenue), 0);
  const minValue = 0;
  const safeRange = maxValue - minValue || 1;

  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Không có dữ liệu biểu đồ trong khoảng thời gian này.
      </div>
    );
  }

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((item.revenue - minValue) / safeRange) * (height - padding * 2);
    return { x, y, ...item };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
        {gridValues.map((ratio) => {
          const y = height - padding - ratio * (height - padding * 2);
          const labelValue = minValue + safeRange * ratio;

          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
              <text x={0} y={y + 4} fill="#64748b" fontSize="12">
                {formatCompactCurrency(labelValue)}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round" />

        {points.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle cx={point.x} cy={point.y} r="5" fill="#14b8a6" />
            <text x={point.x} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="11">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
