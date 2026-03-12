import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      localStorage.setItem('user', JSON.stringify({ email: email.trim(), name: name.trim() }));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #a8c4ec 0%, #5379ae 45%, #0474c4 100%)' }}
    >
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl shadow-2xl p-8 md:p-10 border"
            style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
                Create your account
              </h1>
              <p className="mt-2 text-sm" style={{ color: '#5379ae' }}>
                Start tracking competitors with RivalPulse
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm border"
                  style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
                >
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#0f172a' }}
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    borderColor: '#d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#0f172a',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#0f172a' }}
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    borderColor: '#d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#0f172a',
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: '#0f172a' }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb',
                      color: '#0f172a',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: '#0f172a' }}
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb',
                      color: '#0f172a',
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0474c4' }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#0474c4' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
