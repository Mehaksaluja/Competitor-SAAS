import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Watchlist', icon: '📋' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside
      className="w-60 min-h-screen flex flex-col border-r border-white/10 shrink-0"
      style={{ backgroundColor: '#262b40' }}
    >
      <div className="p-4 border-b border-white/10">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-bold text-white">RivalPulse</span>
        </NavLink>
        <p className="mt-1 text-xs" style={{ color: '#a8c4ec' }}>
          Competitor watchlist
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition no-underline ${
                isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: '#06457f' } : {}
            }
          >
            <span className="text-base opacity-90">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <p className="text-xs px-3 py-1" style={{ color: '#5379ae' }}>
          Track competitors 24/7
        </p>
      </div>
    </aside>
  );
}
