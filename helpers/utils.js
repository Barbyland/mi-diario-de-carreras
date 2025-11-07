// helpers/utils.js
// Funciones auxiliares reutilizables

// Convierte "HH:MM:SS" o "MM:SS" en minutos decimales
export function parseDurationToMinutes(value) {
  if (!value || typeof value !== 'string') return 0;
  const parts = value.trim().split(':').map(Number);
  if (parts.some(n => Number.isNaN(n))) return 0;

  let h = 0, m = 0, s = 0;
  if (parts.length === 2) [m, s] = parts;
  if (parts.length === 3) [h, m, s] = parts;

  const totalMin = h * 60 + m + s / 60;
  return Number.isFinite(totalMin) ? totalMin : 0;
}

// Convierte minutos totales y distancia en ritmo (pace) mm:ss/km
export function minutesToPace(minutes, distanceKm) {
  const pace = distanceKm > 0 ? minutes / distanceKm : 0;
  const mm = Math.floor(pace);
  const ss = Math.round((pace - mm) * 60);
  const ssStr = String(ss).padStart(2, '0');
  return `${mm}:${ssStr}`;
}

// Formatea fecha ISO (YYYY-MM-DD) a DD/MM/YYYY
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

// Suma valores de un array según selector
export function sumBy(arr, selector) {
  return (arr || []).reduce((acc, x) => acc + (Number(selector(x)) || 0), 0);
}

// Agrupa array por clave o función
export function groupBy(arr, key) {
  return (arr || []).reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

// Crea un elemento HTML con clase y contenido
export function el(tag, classNames = '', html = '') {
  const node = document.createElement(tag);
  if (classNames) node.className = classNames;
  if (html) node.innerHTML = html;
  return node;
}

// Helpers adicionales para este proyecto

// Convierte duración "MM:SS" o "HH:MM:SS" a siempre "HH:MM:SS"
export function toHHMMSS(input) {
  if (!input) return null;
  const parts = input.split(':').map(n => parseInt(n, 10));
  if (parts.length === 2) {
    const [m, s] = parts;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return [h, mm, s].map(v => String(v).padStart(2, '0')).join(':');
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }
  return null;
}

// Safe JSON parse con fallback
export const safeJSON = (str, fallback = []) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

// Acceso rápido a elementos
export const byId = (id) => document.getElementById(id);
