// data/api.js
// Capa HTTP mínima: API BASE, healthcheck y endpoints crudos.
// La normalización UI <-> API se hace en ui/data-layer.js, pero acá
// agregamos un "desempaque" de { items: [...] } para simplificar.

const DEF_BASE = 'http://localhost:3000/api';

// 1) Base de la API (si definís window.API_BASE la toma; si no, usa localhost)
export const API_BASE = (window.API_BASE || DEF_BASE).replace(/\/+$/, '');

// 2) Modo Local: si la URL tiene ?mode=local fuerzo LocalStorage (saltear fetch a API)
const FORCE_LOCAL = new URLSearchParams(location.search).get('mode') === 'local';

// 3) Helper HTTP (devuelve JSON o lanza error legible)
async function http(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch { /* puede no venir JSON */ }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// 4) Healthcheck simple: intenta un GET a /entrenamientos
export async function apiOk() {
  if (FORCE_LOCAL) return false;
  try {
    const r = await fetch(`${API_BASE}/entrenamientos`, { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

// 5) Endpoints crudos (sin normalización)
export const api = {
  // Listar (podés ajustar query según tu backend)
  listEntrenamientos: ({ limit, offset } = {}) => {
    const q = new URLSearchParams();
    if (limit != null)  q.set('limit',  String(limit));
    if (offset != null) q.set('offset', String(offset));
    const qs = q.toString();
    return http(`/entrenamientos${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  // Crear
  createEntrenamiento: (payload) =>
    http('/entrenamientos', { method: 'POST', body: payload }),

  // Actualizar
  updateEntrenamiento: (id, payload) =>
    http(`/entrenamientos/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),

  // Eliminar
  deleteEntrenamiento: (id) =>
    http(`/entrenamientos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// 6) DES-EMPACADOR: tu backend devuelve { items: [...] }
function unpackItems(resp) {
  if (Array.isArray(resp)) return resp;           // por si algún día devuelve array directo
  if (resp && Array.isArray(resp.items)) return resp.items;
  return [];
}

// 7) Funciones “amigables” para la UI (las importa ui/data-layer.js)
export async function listEntrenamientos(opts = {}) {
  if (FORCE_LOCAL) return [];                     // fuerza local => no llamo API
  const data = await api.listEntrenamientos(opts);
  return unpackItems(data);
}
export async function createEntrenamiento(payload) {
  if (FORCE_LOCAL) throw new Error('Local mode');
  return api.createEntrenamiento(payload);
}
export async function updateEntrenamiento(id, payload) {
  if (FORCE_LOCAL) throw new Error('Local mode');
  return api.updateEntrenamiento(id, payload);
}
export async function deleteEntrenamiento(id) {
  if (FORCE_LOCAL) throw new Error('Local mode');
  return api.deleteEntrenamiento(id);
}

// 8) Log útil (sin top-level await raro)
apiOk().then(ok => console.info('Modo de datos:', ok ? 'API' : 'LocalStorage'));
