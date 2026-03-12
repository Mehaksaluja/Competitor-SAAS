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
        <p className="text-white/60">Loading alerts…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Alerts</h1>
          <p className="text-sm mt-0.5" style={{ color: '#a8c4ec' }}>
            Change detections from your watchlist
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white border border-white/20 hover:bg-white/5 transition"
          style={{ color: '#a8c4ec' }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 text-red-300 border border-red-500/30">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="rounded-lg p-8 border border-white/10 bg-white/5 text-center">
          <p className="text-white/70">No alerts yet.</p>
          <p className="text-sm text-white/50 mt-1">Changes will appear here after scans.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="rounded-lg p-4 border border-white/10 bg-white/5">
              <p className="font-medium text-white">{a.title}</p>
              {a.competitor_name && (
                <p className="text-xs text-white/50">{a.competitor_name}</p>
              )}
              {a.description && (
                <p className="text-sm text-white/70 mt-1">{a.description}</p>
              )}
              <p className="text-xs text-white/40 mt-2">
                {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
