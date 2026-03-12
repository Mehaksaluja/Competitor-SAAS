import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await api.listAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadAlerts();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadAlerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading alerts…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Change detections from your watchlist
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="rounded-lg px-4 py-2 text-sm font-medium border hover:bg-gray-50 transition"
          style={{ borderColor: '#e5e7eb', color: '#0474c4' }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div
          className="rounded-lg p-8 border text-center bg-white"
          style={{ borderColor: '#e5e7eb' }}
        >
          <p className="text-gray-700">No alerts yet.</p>
          <p className="text-sm text-gray-500 mt-1">Changes will appear here after scans.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-lg p-4 border bg-white"
              style={{ borderColor: '#e5e7eb' }}
            >
              <p className="font-medium text-gray-900">{a.title}</p>
              {a.competitor_name && (
                <p className="text-xs text-gray-500">{a.competitor_name}</p>
              )}
              {a.description && (
                <p className="text-sm text-gray-700 mt-1">{a.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
