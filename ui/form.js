// ui/form.js
// Lógica del formulario: alta/edición con validación, normalización y pace en vivo

import {
  byId,
  toHHMMSS,
  parseDurationToMinutes,
  minutesToPace
} from '../helpers/utils.js';

const DURACION_RGX = /^(\d{2}:\d{2}:\d{2}|\d{1,2}:\d{2})$/;

const form            = byId('registroForm');
const submitBtn       = form?.querySelector('button[type="submit"]');
const cancelBtn       = byId('btnCancelEdit');
const duracionInput   = byId('duracion');
const duracionError   = byId('duracionError');
const distanciaInput  = byId('distancia');
const paceLive        = byId('paceLive');     // <p id="paceLive" ...>
const duracionHint    = byId('duracionHint'); // <p id="duracionHint" ...>

let currentEditId = null; // estado interno de edición

// ------------------------------
// Helpers robustos para leer/escribir
const getVal = (ids, def = '') => {
  for (const i of ids) {
    const el = byId(i);
    if (el && typeof el.value !== 'undefined') return (el.value || '').trim();
  }
  return def;
};
const setVal = (id, v) => {
  const el = byId(id);
  if (el) el.value = (v ?? '');
};

// ------------------------------
// Pace en vivo debajo del formulario
function updateLivePace() {
  if (!duracionInput || !distanciaInput || !paceLive) return;

  const raw  = (duracionInput.value || '').trim();
  const dist = Number(distanciaInput.value || 0);

  // Ocultar si falta info o el regex no da
  if (!raw || !DURACION_RGX.test(raw) || !dist) {
    paceLive.classList.add('hidden');
    paceLive.textContent = '';
    return;
  }

  // Heurística: si parece HH grande, avisamos
  const parts = raw.split(':').map(n => parseInt(n, 10));
  const suspicious = (parts.length === 3 && parts[0] >= 6);

  const mins = parseDurationToMinutes(raw);    // acepta MM:SS o HH:MM:SS
  const pace = minutesToPace(mins, dist);      // mm:ss

  paceLive.textContent = suspicious
    ? `Revisá duración (parecen ${parts[0]} horas). Pace estimado: ${pace} min/km`
    : `Pace: ${pace} min/km`;

  paceLive.classList.remove('hidden');
}

// ------------------------------
// Lee el form y devuelve payload CONSISTENTE CON LA UI
// (La conversión a contrato de API la hace data-layer.toAPI)
function entradaFromForm() {
  const ciclo = getVal(['ciclo_menstrual', 'ciclo', 'fase_ciclo'], '');
  const alim  = getVal(['alimentacion_previa', 'alimentacion', 'alimentacion_pre'], '');

  // Normalizo duración a HH:MM:SS manteniendo el patrón validado
  const dur = toHHMMSS(getVal(['duracion'])) || '';

  return {
    fecha:               getVal(['fecha']),
    tipo:                getVal(['tipo'], 'Running'),
    distancia:           Number(getVal(['distancia'])) || 0,
    duracion:            dur,
    intensidad:          getVal(['intensidad'], 'Baja'),
    emociones:           getVal(['emociones'], 'Feliz'),
    ciclo_menstrual:     ciclo || '',
    alimentacion_previa: alim  || '',
    comentarios:         getVal(['comentarios']) || ''
  };
}

// ------------------------------
// Completa el form con una entrada (para Editar) — formato UI
export function fillFormUI(e) {
  setVal('fecha', e.fecha || '');
  setVal('tipo', e.tipo ?? 'Running');
  setVal('distancia', Number(e.distancia ?? 0) || '');
  setVal('duracion', e.duracion ?? '');
  setVal('intensidad', e.intensidad ?? 'Baja');
  setVal('emociones', e.emociones ?? 'Feliz');

  const ciclo = e.ciclo_menstrual ?? '';
  ['ciclo_menstrual','ciclo','fase_ciclo'].some(id => {
    const el = byId(id);
    if (el) { el.value = ciclo; return true; }
    return false;
  });

  const alim = e.alimentacion_previa ?? '';
  ['alimentacion_previa','alimentacion','alimentacion_pre'].some(id => {
    const el = byId(id);
    if (el) { el.value = alim; return true; }
    return false;
  });

  setVal('comentarios', e.comentarios ?? '');

  // refresco preview por si ya hay datos
  updateLivePace();
}

function enterEditMode(e) {
  currentEditId = e.id ?? null;
  fillFormUI(e);
  if (submitBtn) submitBtn.textContent = 'Guardar cambios';
  cancelBtn?.classList.remove('hidden');
  form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetEditState() {
  currentEditId = null;
  if (submitBtn) submitBtn.textContent = 'Guardar entrada';
  cancelBtn?.classList.add('hidden');
  form?.reset();
  duracionError?.classList.add('hidden');
  duracionInput?.classList.remove('input-error');
  // oculto preview
  if (paceLive) {
    paceLive.classList.add('hidden');
    paceLive.textContent = '';
  }
}

// ------------------------------
// Validación de duración (con sugerencia)
function validateDuracion() {
  if (!duracionInput) return true;
  const raw = (duracionInput.value || '').trim();
  const okRegex = DURACION_RGX.test(raw);

  let ok = okRegex;
  if (okRegex) {
    const parts = raw.split(':').map(n => parseInt(n, 10));
    if (parts.length === 3) {
      const [h, m, s] = parts;
      if (h >= 6 && m < 60 && s < 60) ok = false; // probablemente era MM:SS
    }
  }

  duracionError.textContent = ok
    ? 'Formato de duración inválido.'
    : 'Revisá la duración: usá HH:MM:SS (00:29:05) o MM:SS (29:05).';
  duracionError?.classList.toggle('hidden', ok);
  duracionInput?.classList.toggle('input-error', !ok);

  // Actualiza/oculta el preview
  if (ok) updateLivePace();
  else if (paceLive) {
    paceLive.classList.add('hidden');
    paceLive.textContent = '';
  }

  return ok;
}

// ------------------------------
// Enlaza validaciones + preview en vivo
function setupFormValidation() {
  if (!duracionInput) return;
  duracionInput.addEventListener('input', () => { validateDuracion(); });
  duracionInput.addEventListener('blur',  () => { validateDuracion(); });

  distanciaInput?.addEventListener('input', () => { if (validateDuracion()) updateLivePace(); });

  // hint inicial opcional
  if (duracionHint) duracionHint.textContent = 'Ej: 00:29:05 o 29:05';
}

// ------------------------------
// Inicializa eventos y delega save/cancel al que llama (index.js)
export function initForm({ onSave, onCancel } = {}) {
  if (!form) {
    console.error('No se encontró #registroForm en el DOM.');
    return;
  }

  setupFormValidation();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!validateDuracion()) return;

    const payload = entradaFromForm();
    await onSave?.(payload, currentEditId);
    resetEditState();
  });

  cancelBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    resetEditState();
    onCancel?.();
  });
}

// Exports para que index.js u otros módulos puedan controlar el form
export const UIForm = {
  initForm,
  enterEditMode,
  resetEditState,
  validateDuracion,
  setupFormValidation,
  entradaFromForm,
  get currentEditId() { return currentEditId; },
  set currentEditId(v) { currentEditId = v; }
};
