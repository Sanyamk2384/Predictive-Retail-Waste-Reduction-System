export default function StatCard({ label, value, hint, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-ink",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  }[tone];

  return (
    <div className="rounded-lg border border-hairline bg-canvas p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-soft">{hint}</p>}
    </div>
  );
}
