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
      className="h-14 flex items-center justify-between px-4 shrink-0 border-b"
      style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold hidden sm:block" style={{ color: '#0474c4' }}>
          Dashboard
        </h2>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
          style={{ color: '#111827' }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
            style={{ backgroundColor: '#0474c4' }}
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[120px] truncate hidden sm:inline">
            {user?.name || user?.email || 'User'}
          </span>
          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <div
              className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl border z-20 min-w-[200px] bg-white"
              style={{ borderColor: '#e5e7eb' }}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs truncate" style={{ color: '#6b7280' }}>
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
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
