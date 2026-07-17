const TYPES = new Set(['Running', 'Bicicleta', 'Caminata', 'Otra']);
const INTENSITIES = new Set(['', 'Baja', 'Media', 'Alta']);
const CYCLE_PHASES = new Set(['', 'Folicular', 'Ovulatoria', 'Lutea', 'Menstrual']);
const DURATION_PATTERN = /^\d{2}:[0-5]\d:[0-5]\d$/;

export function parsePositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

export function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidDuration(value) {
  return DURATION_PATTERN.test(value || '');
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export function validateEntry(input) {
  const entry = {
    fecha: cleanText(input.fecha, 10),
    tipo: cleanText(input.tipo, 50),
    distancia_km: Number(input.distancia_km),
    duracion: cleanText(input.duracion, 8),
    intensidad: cleanText(input.intensidad, 50),
    sentimiento: cleanText(input.sentimiento, 100),
    descripcion: cleanText(input.descripcion, 2000),
    ciclo_menstrual: cleanText(input.ciclo_menstrual, 50),
    alimentacion_previa: cleanText(input.alimentacion_previa, 150)
  };

  const errors = [];
  if (!isValidDate(entry.fecha)) errors.push('fecha debe usar YYYY-MM-DD y ser válida');
  if (!TYPES.has(entry.tipo)) errors.push('tipo no permitido');
  if (!Number.isFinite(entry.distancia_km) || entry.distancia_km <= 0 || entry.distancia_km > 1000) {
    errors.push('distancia_km debe ser mayor que 0 y menor o igual a 1000');
  }
  if (!isValidDuration(entry.duracion)) errors.push('duracion debe usar HH:MM:SS con minutos y segundos válidos');
  if (!INTENSITIES.has(entry.intensidad)) errors.push('intensidad no permitida');
  if (!CYCLE_PHASES.has(entry.ciclo_menstrual)) errors.push('ciclo_menstrual no permitido');

  return { entry, errors };
}
