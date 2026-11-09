import { forwardRef } from "react";

const Select = forwardRef(function Select({ label, error, className = "", children, ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <select
        ref={ref}
        className={`h-10 w-full rounded-md border bg-canvas px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-hairline focus:border-ink"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
});

export default Select;
