import React from 'react';
import { NavLink } from 'react-router-dom';

function DashboardIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 17h14M8 17v-5a4 4 0 118 0v5M10 20a2 2 0 004 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 9.5L4 8m15.5 1.5L20 8M9.5 5.5L8 4m7.5 1.5L16 4M9.5 18.5L8 20m7.5-1.5L16 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { to: '/', label: 'Watchlist', icon: DashboardIcon },
  { to: '/alerts', label: 'Alerts', icon: BellIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside
      className="w-60 min-h-screen flex flex-col border-r shrink-0"
      style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
    >
      <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-bold" style={{ color: '#0474c4' }}>
            RivalPulse
          </span>
        </NavLink>
        <p className="mt-1 text-xs" style={{ color: '#6b7280' }}>
          Competitor watchlist
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition no-underline ${
                isActive
                  ? 'text-[#0474c4]'
                  : 'text-[#111827] hover:text-[#0474c4] hover:bg-[#e0f2fe]'
              }`
            }
          >
            <span className="flex items-center justify-center">
              <Icon />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: '#e5e7eb' }}>
        <p className="text-xs px-3 py-1" style={{ color: '#6b7280' }}>
          Track competitors 24/7
        </p>
      </div>
    </aside>
  );
}
