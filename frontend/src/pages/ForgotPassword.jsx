import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #a8c4ec 0%, #5379ae 100%)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl p-8 border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <h1 className="text-xl font-bold" style={{ color: '#262b40' }}>Reset password</h1>
        <p className="mt-2 text-sm" style={{ color: '#5379ae' }}>Coming soon. Contact support for now.</p>
        <Link to="/login" className="inline-block mt-6 text-sm font-medium hover:underline" style={{ color: '#0474c4' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
