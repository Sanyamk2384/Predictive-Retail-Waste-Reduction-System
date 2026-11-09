import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, hint, className = "", ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <input
        ref={ref}
        className={`h-10 w-full rounded-md border px-3.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-hairline focus:border-ink"
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
});

export default Input;
