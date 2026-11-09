import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl">FreshFlow</span>
          <p className="mt-1 text-sm text-muted">Predictive retail waste reduction</p>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas p-8 shadow-soft">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
