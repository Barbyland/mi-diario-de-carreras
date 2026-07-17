import { byId, toHHMMSS, parseDurationToMinutes, minutesToPace } from '../helpers/utils.js';

const DURATION_PATTERN = /^(?:\d{2}:[0-5]\d:[0-5]\d|\d{1,3}:[0-5]\d)$/;
const MAX_DURATION_MINUTES = 24 * 60;

const form = byId('registroForm');
const submitButton = form?.querySelector('button[type="submit"]');
const cancelButton = byId('btnCancelEdit');
const durationInput = byId('duracion');
const durationError = byId('duracionError');
const distanceInput = byId('distancia');
const paceLive = byId('paceLive');
const formStatus = byId('formStatus');
const dateInput = byId('fecha');

let currentEditId = null;

function getValue(id, fallback = '') {
  const element = byId(id);
  return element ? String(element.value || '').trim() : fallback;
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value ?? '';
}

function setStatus(message, kind = 'info') {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.kind = kind;
}

function updateLivePace() {
  if (!durationInput || !distanceInput || !paceLive) return;
  const duration = durationInput.value.trim();
  const distance = Number(distanceInput.value);
  const minutes = parseDurationToMinutes(toHHMMSS(duration) || '');

  if (!DURATION_PATTERN.test(duration) || minutes <= 0 || distance <= 0) {
    paceLive.hidden = true;
    paceLive.textContent = '';
    return;
  }

  paceLive.textContent = `Pace estimado: ${minutesToPace(minutes, distance)} min/km`;
  paceLive.hidden = false;
}

export function validateDuration() {
  if (!durationInput) return true;
  const raw = durationInput.value.trim();
  const normalized = toHHMMSS(raw);
  const minutes = parseDurationToMinutes(normalized || '');
  const valid = DURATION_PATTERN.test(raw) && minutes > 0 && minutes <= MAX_DURATION_MINUTES;

  durationInput.setAttribute('aria-invalid', String(!valid));
  durationInput.classList.toggle('input-error', !valid);
  if (durationError) {
    durationError.hidden = valid;
    durationError.textContent = 'Usá HH:MM:SS o MM:SS, con segundos válidos y una duración máxima de 24 horas.';
  }

  if (valid) updateLivePace();
  else if (paceLive) {
    paceLive.hidden = true;
    paceLive.textContent = '';
  }
  return valid;
}

export function entryFromForm() {
  return {
    fecha: getValue('fecha'),
    tipo: getValue('tipo', 'Running'),
    distancia: Number(getValue('distancia')),
    duracion: toHHMMSS(getValue('duracion')) || '',
    intensidad: getValue('intensidad', 'Baja'),
    emociones: getValue('emociones', 'Feliz'),
    ciclo_menstrual: getValue('ciclo_menstrual'),
    alimentacion_previa: getValue('alimentacion_previa'),
    comentarios: getValue('comentarios')
  };
}

export function fillForm(entry) {
  setValue('fecha', entry.fecha);
  setValue('tipo', entry.tipo || 'Running');
  setValue('distancia', entry.distancia ?? entry.distancia_km ?? '');
  setValue('duracion', entry.duracion);
  setValue('intensidad', entry.intensidad || 'Baja');
  setValue('emociones', entry.emociones ?? entry.sentimiento ?? 'Feliz');
  setValue('ciclo_menstrual', entry.ciclo_menstrual);
  setValue('alimentacion_previa', entry.alimentacion_previa);
  setValue('comentarios', entry.comentarios ?? entry.descripcion ?? '');
  updateLivePace();
}

function enterEditMode(entry) {
  currentEditId = entry.id ?? null;
  fillForm(entry);
  if (submitButton) submitButton.textContent = 'Guardar cambios';
  if (cancelButton) cancelButton.hidden = false;
  setStatus('Editando registro.');
  form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetEditState() {
  currentEditId = null;
  form?.reset();
  if (submitButton) submitButton.textContent = 'Guardar entrada';
  if (cancelButton) cancelButton.hidden = true;
  if (durationError) durationError.hidden = true;
  durationInput?.classList.remove('input-error');
  durationInput?.setAttribute('aria-invalid', 'false');
  if (paceLive) {
    paceLive.hidden = true;
    paceLive.textContent = '';
  }
}

function setupValidation() {
  if (dateInput) dateInput.max = new Date().toISOString().slice(0, 10);
  durationInput?.addEventListener('input', validateDuration);
  durationInput?.addEventListener('blur', validateDuration);
  distanceInput?.addEventListener('input', updateLivePace);
}

export function initForm({ onSave, onCancel } = {}) {
  if (!form) return;
  setupValidation();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateDuration()) {
      durationInput?.focus();
      return;
    }

    const editingId = currentEditId;
    if (submitButton) submitButton.disabled = true;
    setStatus(editingId ? 'Guardando cambios…' : 'Guardando entrenamiento…');
    try {
      await onSave?.(entryFromForm(), editingId);
      resetEditState();
      setStatus(editingId ? 'Cambios guardados.' : 'Entrenamiento registrado.', 'success');
    } catch (error) {
      setStatus(`No se pudo guardar: ${error.message}`, 'error');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  cancelButton?.addEventListener('click', () => {
    resetEditState();
    setStatus('Edición cancelada.');
    onCancel?.();
  });
}

export const UIForm = {
  enterEditMode,
  resetEditState,
  validateDuration,
  entryFromForm,
  get currentEditId() { return currentEditId; }
};
