const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** URL for a competitor screenshot image (page: homepage | pricing | product) */
export function getScreenshotUrl(competitorId, page) {
  return `${BASE}/screenshots/${competitorId}/${page}.png`;
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.detail || data?.error || res.statusText);
  return data;
}

export const api = {
  health: () => request('/health'),
  listCompetitors: () => request('/competitors'),
  addCompetitor: (body) => request('/competitors', { method: 'POST', body: JSON.stringify(body) }),
  getCompetitor: (id) => request(`/competitors/${id}`),
  deleteCompetitor: (id) => request(`/competitors/${id}`, { method: 'DELETE' }),
  triggerScan: (competitorId) => request(`/scan/${competitorId}`, { method: 'POST' }),
  listSnapshots: (competitorId) => request(`/scan/${competitorId}/snapshots`),
  listAlerts: (competitorId) => request(competitorId ? `/alerts?competitor_id=${competitorId}` : '/alerts'),
  getAlert: (id) => request(`/alerts/${id}`),
};
