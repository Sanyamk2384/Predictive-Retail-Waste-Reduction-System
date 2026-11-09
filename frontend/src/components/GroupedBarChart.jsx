// Lightweight dependency-free grouped bar chart (no charting library in the stack).
export default function GroupedBarChart({ data, seriesA, seriesB, height = 240 }) {
  if (!data?.length) return null;
  const maxValue = Math.max(1, ...data.flatMap((d) => [d[seriesA.key] || 0, d[seriesB.key] || 0]));
  const barHeightPx = height - 48;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seriesA.color }} />
          {seriesA.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seriesB.color }} />
          {seriesB.label}
        </span>
      </div>
      <div className="flex items-end gap-4 overflow-x-auto pb-1" style={{ height }}>
        {data.map((item) => (
          <div key={item.label} className="flex min-w-[64px] flex-col items-center gap-1.5">
            <div className="flex items-end gap-1" style={{ height: barHeightPx }}>
              <div
                className="w-4 rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(2, ((item[seriesA.key] || 0) / maxValue) * barHeightPx)}px`,
                  backgroundColor: seriesA.color,
                }}
                title={`${seriesA.label}: ${item[seriesA.key]}`}
              />
              <div
                className="w-4 rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(2, ((item[seriesB.key] || 0) / maxValue) * barHeightPx)}px`,
                  backgroundColor: seriesB.color,
                }}
                title={`${seriesB.label}: ${item[seriesB.key]}`}
              />
            </div>
            <span className="max-w-[72px] truncate text-center text-xs text-muted" title={item.label}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
