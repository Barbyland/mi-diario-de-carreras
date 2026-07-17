const DEFAULT_API_BASE = 'http://localhost:3000/api';
const params = new URLSearchParams(window.location.search);
const isPublishedDemo = window.location.hostname.endsWith('github.io');
const forceLocal = params.get('mode') === 'local' || (isPublishedDemo && params.get('mode') !== 'api');

export const API_BASE = (
  window.API_BASE || params.get('api') || DEFAULT_API_BASE
).replace(/\/+$/, '');

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function http(path, { method = 'GET', body, headers } = {}) {
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export async function apiOk() {
  if (forceLocal) return false;
  try {
    const response = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET' }, 1500);
    return response.ok;
  } catch {
    return false;
  }
}

export const api = {
  listEntrenamientos({ limit, offset } = {}) {
    const query = new URLSearchParams();
    if (limit != null) query.set('limit', String(limit));
    if (offset != null) query.set('offset', String(offset));
    const suffix = query.toString();
    return http(`/entrenamientos${suffix ? `?${suffix}` : ''}`);
  },
  createEntrenamiento(payload) {
    return http('/entrenamientos', { method: 'POST', body: payload });
  },
  updateEntrenamiento(id, payload) {
    return http(`/entrenamientos/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
  },
  deleteEntrenamiento(id) {
    return http(`/entrenamientos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
};

export async function listEntrenamientos(options = {}) {
  const response = await api.listEntrenamientos(options);
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.items) ? response.items : [];
}

export const createEntrenamiento = (payload) => api.createEntrenamiento(payload);
export const updateEntrenamiento = (id, payload) => api.updateEntrenamiento(id, payload);
export const deleteEntrenamiento = (id) => api.deleteEntrenamiento(id);
