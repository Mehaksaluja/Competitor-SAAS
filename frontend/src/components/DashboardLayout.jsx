import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export default function DashboardLayout() {
  const user = getUser();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#262b40' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#32384f' }}>
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
