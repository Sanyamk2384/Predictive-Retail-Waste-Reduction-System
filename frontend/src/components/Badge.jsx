const TONES = {
  neutral: "bg-surface-card text-ink",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  "danger-strong": "bg-red-600 text-white",
  violet: "bg-violet-50 text-violet-700",
  dark: "bg-surface-dark text-on-dark",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
