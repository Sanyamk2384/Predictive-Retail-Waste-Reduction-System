export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-ink" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
