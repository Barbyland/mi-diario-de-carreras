// ui/data-layer.js — capa de datos para la UI
// Usa API real si está disponible y cae a LocalStorage si no.
// Además normaliza UI <-> API.

import {
  apiOk,
  listEntrenamientos,
  createEntrenamiento,
  updateEntrenamiento,
  deleteEntrenamiento
} from '../data/api.js';

// =========================
// LocalStorage helpers
// =========================
const LS_KEY = 'mdc:entradas:v1';

// (migración 1 sola vez desde 'entradas' → 'mdc:entradas:v1')
(function migrateOnce() {
  try {
    const oldKey = 'entradas';
    if (!localStorage.getItem(LS_KEY) && localStorage.getItem(oldKey)) {
      localStorage.setItem(LS_KEY, localStorage.getItem(oldKey));
      console.info('Migradas entradas locales →', LS_KEY);
    }
  } catch { /* ignore */ }
})();

function lsRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function lsWrite(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

// =========================
// Normalización API → UI
// =========================
function extraer(descripcion, clave) {
  if (!descripcion) return '';
  const hit = descripcion
    .split('|')
    .map(s => s.trim())
    .find(p => p.toLowerCase().startsWith(clave.toLowerCase() + ':'));
  return hit ? hit.split(':').slice(1).join(':').trim() : '';
}

function fromAPI(row) {
  return {
    id: row.id ?? row.entrenamiento_id ?? undefined,
    fecha: row.fecha || '',
    tipo: row.tipo || '',
    distancia: Number(row.distancia_km ?? row.distancia ?? 0) || 0,
    duracion: row.duracion || '',
    intensidad: extraer(row.descripcion, 'Intensidad') || (row.intensidad ?? '') || '',
    emociones: row.sentimiento || '',
    comentarios: extraer(row.descripcion, 'Notas') || (row.descripcion ?? ''),
    ciclo_menstrual: row.ciclo_menstrual || '',
    alimentacion_previa: row.alimentacion_previa || ''
  };
}

// =========================
// Normalización UI → API
// =========================
function toAPI(ui) {
  return {
    fecha: ui.fecha,
    tipo: ui.tipo,
    distancia_km: Number(ui.distancia ?? ui.distancia_km ?? 0) || 0,
    duracion: ui.duracion || '00:00:00',
    descripcion: [
      ui.comentarios?.trim() ? `Notas: ${ui.comentarios.trim()}` : null,
      ui.intensidad ? `Intensidad: ${ui.intensidad}` : null
    ].filter(Boolean).join(' | ') || null,
    clima: null,
    sentimiento: ui.emociones || null,
    ciclo_menstrual: ui.ciclo_menstrual || null,
    alimentacion_previa: ui.alimentacion_previa || null
  };
}

// =========================
// API pública para la UI
// =========================
export async function cargarEntradas() {
  try {
    if (await apiOk()) {
      // listEntrenamientos YA devuelve array (desempacado)
      const rows = await listEntrenamientos({ limit: 100, offset: 0 });
      return rows.map(fromAPI);
    }
  } catch (e) {
    console.warn('Fallo API, uso LocalStorage:', e.message);
  }
  return lsRead(); // formato UI directo
}

export async function guardarEntrada(entradaUI) {
  const body = toAPI(entradaUI);
  try {
    if (await apiOk()) {
      const created = await createEntrenamiento(body);
      return fromAPI(created);
    }
  } catch (e) {
    console.warn('POST API falló, guardo en LS:', e.message);
  }
  const all = lsRead();
  const id = (crypto?.randomUUID?.() || String(Date.now()));
  const withId = { id, ...entradaUI };
  all.push(withId); lsWrite(all);
  return withId;
}

export async function actualizarEntrada(id, entradaUI) {
  const body = toAPI(entradaUI);
  try {
    if (await apiOk()) {
      const updated = await updateEntrenamiento(id, body);
      return fromAPI(updated);
    }
  } catch (e) {
    console.warn('PUT API falló, actualizo en LS:', e.message);
  }
  const all = lsRead();
  const i = all.findIndex(x => String(x.id) === String(id));
  if (i >= 0) {
    all[i] = { ...all[i], ...entradaUI, id: all[i].id };
    lsWrite(all);
    return all[i];
  }
  return null;
}

export async function eliminarEntrada(id) {
  try {
    if (await apiOk()) {
      await deleteEntrenamiento(id);
      return true;
    }
  } catch (e) {
    console.warn('DELETE API falló, borro en LS:', e.message);
  }
  const next = lsRead().filter(x => String(x.id) !== String(id));
  lsWrite(next);
  return true;
}

