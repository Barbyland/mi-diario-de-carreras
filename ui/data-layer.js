import {
  apiOk,
  listEntrenamientos,
  createEntrenamiento,
  updateEntrenamiento,
  deleteEntrenamiento
} from '../data/api.js';

const STORAGE_KEY = 'mdc:entradas:v1';
let apiAvailable;

(function migrateLegacyStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem('entradas')) {
      localStorage.setItem(STORAGE_KEY, localStorage.getItem('entradas'));
    }
  } catch {
    // La aplicación seguirá funcionando sin persistencia si el navegador la bloquea.
  }
}());

function readLocal() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocal(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

async function shouldUseApi() {
  if (apiAvailable === undefined) apiAvailable = await apiOk();
  return apiAvailable;
}

function disableApi(error) {
  apiAvailable = false;
  console.warn('La API no está disponible; se usa LocalStorage.', error?.message || error);
}

function fromApi(row) {
  return {
    id: row.id ?? row.entrenamiento_id,
    fecha: row.fecha || '',
    tipo: row.tipo || '',
    distancia: Number(row.distancia_km ?? row.distancia ?? 0) || 0,
    duracion: row.duracion || '',
    intensidad: row.intensidad || '',
    emociones: row.sentimiento || '',
    comentarios: row.descripcion || '',
    ciclo_menstrual: row.ciclo_menstrual || '',
    alimentacion_previa: row.alimentacion_previa || ''
  };
}

function toApi(entry) {
  return {
    fecha: entry.fecha,
    tipo: entry.tipo,
    distancia_km: Number(entry.distancia) || 0,
    duracion: entry.duracion || '00:00:00',
    intensidad: entry.intensidad || '',
    sentimiento: entry.emociones || '',
    descripcion: entry.comentarios?.trim() || '',
    ciclo_menstrual: entry.ciclo_menstrual || '',
    alimentacion_previa: entry.alimentacion_previa || ''
  };
}

export async function cargarEntradas() {
  if (await shouldUseApi()) {
    try {
      return (await listEntrenamientos({ limit: 100, offset: 0 })).map(fromApi);
    } catch (error) {
      disableApi(error);
    }
  }
  return readLocal();
}

export async function guardarEntrada(entry) {
  if (await shouldUseApi()) {
    try {
      return fromApi(await createEntrenamiento(toApi(entry)));
    } catch (error) {
      disableApi(error);
    }
  }

  const entries = readLocal();
  const id = globalThis.crypto?.randomUUID?.() || String(Date.now());
  const saved = { id, ...entry };
  writeLocal([...entries, saved]);
  return saved;
}

export async function actualizarEntrada(id, entry) {
  if (await shouldUseApi()) {
    try {
      return fromApi(await updateEntrenamiento(id, toApi(entry)));
    } catch (error) {
      disableApi(error);
    }
  }

  const entries = readLocal();
  const index = entries.findIndex((item) => String(item.id) === String(id));
  if (index < 0) return null;
  entries[index] = { ...entries[index], ...entry, id: entries[index].id };
  writeLocal(entries);
  return entries[index];
}

export async function eliminarEntrada(id) {
  if (await shouldUseApi()) {
    try {
      await deleteEntrenamiento(id);
      return true;
    } catch (error) {
      disableApi(error);
    }
  }

  writeLocal(readLocal().filter((item) => String(item.id) !== String(id)));
  return true;
}
