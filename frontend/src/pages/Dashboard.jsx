import React, { useState, useEffect, useCallback } from 'react';
import { api, getScreenshotUrl } from '../api';

function ScreenshotImage({ competitorId, page }) {
  const [error, setError] = useState(false);
  const src = getScreenshotUrl(competitorId, page);
  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        Image not found
      </div>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={src}
        alt={page}
        className="w-full h-auto object-contain max-h-80"
        onError={() => setError(true)}
      />
    </a>
  );
}

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
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Competitor Watchlist</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
          Add URLs and run scans to track changes
        </p>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>
          Add competitor
        </h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs mb-1 text-gray-600">Website URL</label>
            <input
              type="url"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              placeholder="https://competitor.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#0474c4]"
              style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#111827' }}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs mb-1 text-gray-600">Name (optional)</label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Competitor name"
              className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-[#0474c4]"
              style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#111827' }}
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
        <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>
          Watchlist
        </h2>
        {competitors.length === 0 ? (
          <p className="text-sm text-gray-500">No competitors yet. Add a URL above.</p>
        ) : (
          <ul className="space-y-2">
            {competitors.map((c) => (
              <li
                key={c.id}
                className="rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 border bg-white"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{c.name || c.url}</p>
                  <p className="text-sm text-gray-600 truncate">{c.url}</p>
                  {c.last_scanned_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last scan: {new Date(c.last_scanned_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleScan(c.id)}
                    disabled={scanningId === c.id}
                    className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition border"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {scanningId === c.id ? 'Scanning…' : 'Scan now'}
                  </button>
                  <button
                    onClick={() => loadSnapshots(c.id)}
                    className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition border"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    View snapshots
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 transition"
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
            <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
              Snapshots
            </h2>
            <button onClick={closeSnapshots} className="text-sm text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
          {snapshots.length === 0 ? (
            <p className="text-sm text-gray-500">No snapshots yet. Run a scan first.</p>
          ) : (
            <ul className="space-y-6">
              {snapshots.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg p-4 border bg-white"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                  </p>
                  {s.summary && <p className="text-sm text-gray-800 mb-3">{s.summary}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(s.screenshots || []).map((sc, i) => (
                      <div key={i} className="rounded-lg border overflow-hidden bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
                        <p className="text-xs font-medium px-2 py-1.5 capitalize" style={{ color: '#6b7280' }}>
                          {sc.page}
                        </p>
                        {competitorIdForSnapshots && sc.path ? (
                          <ScreenshotImage
                            competitorId={competitorIdForSnapshots}
                            page={sc.page}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
