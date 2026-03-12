import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export default function Navbar({ user: userProp }) {
  const user = userProp ?? getUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    setOpen(false);
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-white/10"
      style={{ backgroundColor: '#06457f' }}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-white/90 hidden sm:block">
          Dashboard
        </h2>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition"
        >
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: '#0474c4' }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[120px] truncate hidden sm:inline">
            {user?.name || user?.email || 'User'}
          </span>
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <div
              className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl border border-white/10 z-20 min-w-[180px]"
              style={{ backgroundColor: '#262b40' }}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs truncate" style={{ color: '#a8c4ec' }}>{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
