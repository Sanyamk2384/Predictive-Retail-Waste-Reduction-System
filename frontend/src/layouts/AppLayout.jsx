import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  IconGrid,
  IconUpload,
  IconLayers,
  IconBox,
  IconStore,
  IconUser,
  IconLogout,
  IconMenu,
  IconClose,
} from "../components/icons.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: IconGrid, end: true },
  { to: "/upload", label: "Upload data", icon: IconUpload },
  { to: "/inventory", label: "Inventory batches", icon: IconLayers },
  { to: "/products", label: "Products", icon: IconBox },
  { to: "/stores", label: "Stores", icon: IconStore },
  { to: "/settings", label: "Settings", icon: IconUser },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "bg-ink text-on-primary" : "text-body hover:bg-surface-soft"
            }`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-hairline px-4 lg:hidden">
        <span className="font-display text-lg">FreshFlow</span>
        <button onClick={() => setMobileOpen(true)} className="rounded-md p-2 hover:bg-surface-soft" aria-label="Open menu">
          <IconMenu />
        </button>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-hairline p-5 lg:flex lg:flex-col lg:justify-between lg:h-screen lg:sticky lg:top-0">
          <div>
            <div className="mb-8 flex items-center gap-2 px-1">
              <span className="font-display text-xl">FreshFlow</span>
            </div>
            <NavLinks />
          </div>
          <div className="border-t border-hairline pt-4">
            <p className="truncate px-3 text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate px-3 text-xs text-muted">{user?.email}</p>
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-body hover:bg-surface-soft"
            >
              <IconLogout />
              Log out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative flex h-full w-72 flex-col justify-between bg-canvas p-5">
              <div>
                <div className="mb-8 flex items-center justify-between px-1">
                  <span className="font-display text-xl">FreshFlow</span>
                  <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                    <IconClose />
                  </button>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="border-t border-hairline pt-4">
                <p className="truncate px-3 text-sm font-medium text-ink">{user?.name}</p>
                <p className="truncate px-3 text-xs text-muted">{user?.email}</p>
                <button
                  onClick={logout}
                  className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-body hover:bg-surface-soft"
                >
                  <IconLogout />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
