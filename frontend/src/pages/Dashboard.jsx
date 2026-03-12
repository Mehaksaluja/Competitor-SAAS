import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [competitors, setCompetitors] = useState([]);
  const [snapshots, setSnapshots] = useState(null);
  const [competitorIdForSnapshots, setCompetitorIdForSnapshots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addUrl, setAddUrl] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [scanningId, setScanningId] = useState(null);

  const loadCompetitors = useCallback(async () => {
    try {
      const data = await api.listCompetitors();
      setCompetitors(Array.isArray(data) ? data : []);
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
        await api.health();
        await loadCompetitors();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Backend not reachable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadCompetitors]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const url = addUrl.trim();
    if (!url) return;
    setAdding(true);
    setError(null);
    try {
      await api.addCompetitor({ url, name: addName.trim() || undefined });
      setAddUrl('');
      setAddName('');
      await loadCompetitors();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this competitor from the watchlist?')) return;
    setError(null);
    try {
      await api.deleteCompetitor(id);
      await loadCompetitors();
      if (competitorIdForSnapshots === id) {
        setSnapshots(null);
        setCompetitorIdForSnapshots(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleScan = async (id) => {
    setScanningId(id);
    setError(null);
    try {
      await api.triggerScan(id);
      await loadCompetitors();
      await loadSnapshots(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setScanningId(null);
    }
  };

  const loadSnapshots = async (id) => {
    setError(null);
    try {
      const data = await api.listSnapshots(id);
      setSnapshots(Array.isArray(data) ? data : []);
      setCompetitorIdForSnapshots(id);
    } catch (e) {
      setError(e.message);
    }
  };

  const closeSnapshots = () => {
    setSnapshots(null);
    setCompetitorIdForSnapshots(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/60">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Competitor Watchlist</h1>
        <p className="text-sm mt-0.5" style={{ color: '#a8c4ec' }}>
          Add URLs and run scans to track changes
        </p>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 text-red-300 border border-red-500/30">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: '#a8c4ec' }}>
          Add competitor
        </h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs mb-1 text-white/70">Website URL</label>
            <input
              type="url"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              placeholder="https://competitor.com"
              className="w-full rounded-lg px-3 py-2.5 text-white placeholder:text-white/40 border focus:outline-none focus:ring-2 focus:ring-[#0474c4] focus:border-transparent bg-white/5"
              style={{ borderColor: '#5379ae' }}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs mb-1 text-white/70">Name (optional)</label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Competitor name"
              className="w-full rounded-lg px-3 py-2.5 text-white placeholder:text-white/40 border focus:outline-none focus:ring-2 focus:ring-[#0474c4] bg-white/5"
              style={{ borderColor: '#5379ae' }}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !addUrl.trim()}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-95"
            style={{ backgroundColor: '#0474c4' }}
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: '#a8c4ec' }}>
          Watchlist
        </h2>
        {competitors.length === 0 ? (
          <p className="text-sm text-white/50">No competitors yet. Add a URL above.</p>
        ) : (
          <ul className="space-y-2">
            {competitors.map((c) => (
              <li
                key={c.id}
                className="rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{c.name || c.url}</p>
                  <p className="text-sm text-white/60 truncate">{c.url}</p>
                  {c.last_scanned_at && (
                    <p className="text-xs text-white/40 mt-1">
                      Last scan: {new Date(c.last_scanned_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleScan(c.id)}
                    disabled={scanningId === c.id}
                    className="rounded-md px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50 transition border border-white/10"
                  >
                    {scanningId === c.id ? 'Scanning…' : 'Scan now'}
                  </button>
                  <button
                    onClick={() => loadSnapshots(c.id)}
                    className="rounded-md px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition border border-white/10"
                  >
                    View snapshots
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 transition"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {snapshots !== null && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: '#a8c4ec' }}>
              Snapshots
            </h2>
            <button onClick={closeSnapshots} className="text-sm text-white/60 hover:text-white">
              Close
            </button>
          </div>
          {snapshots.length === 0 ? (
            <p className="text-sm text-white/50">No snapshots yet. Run a scan first.</p>
          ) : (
            <ul className="space-y-3">
              {snapshots.map((s) => (
                <li key={s.id} className="rounded-lg p-4 border border-white/10 bg-white/5">
                  <p className="text-xs text-white/40 mb-2">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                  </p>
                  {s.summary && <p className="text-sm text-white/80 mb-2">{s.summary}</p>}
                  <ul className="flex flex-wrap gap-2">
                    {(s.screenshots || []).map((sc, i) => (
                      <li key={i} className="text-xs text-white/50">
                        {sc.page}: {sc.path ? 'saved' : '—'}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
