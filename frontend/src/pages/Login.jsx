import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Placeholder: accept any non-empty login for now
      if (!email.trim() || !password) {
        setError('Please enter email and password.');
        return;
      }
      localStorage.setItem('user', JSON.stringify({ email: email.trim() }));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #a8c4ec 0%, #5379ae 50%, #2c444c 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#262b40' }}>
                Welcome back
              </h1>
              <p className="mt-2 text-sm" style={{ color: '#5379ae' }}>
                Sign in to your account
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#b91c1c' }}>
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#262b40' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg px-4 py-3 text-[#262b40] placeholder:text-[#5379ae]/70 border transition focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: '#5379ae', backgroundColor: '#f8fafc' }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#262b40' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg px-4 py-3 text-[#262b40] placeholder:text-[#5379ae]/70 border transition focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: '#5379ae', backgroundColor: '#f8fafc' }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#2c444c' }}>
                  <input type="checkbox" className="rounded border-[#5379ae] text-[#0474c4] focus:ring-[#0474c4]" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: '#0474c4' }}>
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 font-semibold text-white transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0474c4' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm" style={{ color: '#5379ae' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: '#0474c4' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
