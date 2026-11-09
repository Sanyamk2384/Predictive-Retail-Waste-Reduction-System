const VARIANTS = {
  primary: "bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted",
  secondary: "bg-canvas text-ink border border-hairline hover:bg-surface-soft",
  danger: "bg-canvas text-danger border border-hairline hover:bg-red-50",
  ghost: "bg-transparent text-ink hover:bg-surface-soft",
};

const SIZES = {
  md: "h-10 px-5 text-sm",
  sm: "h-8 px-3 text-xs",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
