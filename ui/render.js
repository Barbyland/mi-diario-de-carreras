// ui/render.js — ES Module + compatibilidad con window.UIRender
import { formatDate, parseDurationToMinutes, minutesToPace } from '../helpers/utils.js';

// Normaliza a clase css (minúsculas, sin tildes, sin espacios)
function normalizarClase(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

// Cabecera “origen de datos”
export function setOrigen(origen) {
  const el = document.getElementById('origenDatos');
  if (el) el.textContent = `Origen de datos: ${origen}`;
}

// Resumen (Total km / # Entradas)
export function renderResumen(entradas) {
  const totalKm = (entradas || []).reduce((acc, e) => {
    const v = Number(e.distancia ?? e.distancia_km ?? 0);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);

  const li = document.createElement('li');
  li.className = 'resumen';
  li.innerHTML =
    `<strong>Total km:</strong> ${totalKm.toFixed(2)} · ` +
    `<strong>Entradas:</strong> ${(entradas || []).length}`;
  return li;
}

// Item (tarjeta) con emojis y sin duplicar ciclo
export function renderEntradaItem(e, { onEdit, onDelete } = {}) {
  const distancia   = Number(e.distancia ?? e.distancia_km ?? 0);
  const duracion    = e.duracion || '-';
  const intensidad  = e.intensidad || '-';
  const emociones   = (e.emociones ?? e.sentimiento) || '-';
  const ciclo       = e.ciclo_menstrual || '';
  const alim        = e.alimentacion_previa || '';
  const comentarios = (e.comentarios ?? e.descripcion) || '';

  const fechaFmt = formatDate(e.fecha) || (e.fecha ?? '');
  const mins     = parseDurationToMinutes(duracion);
  const pace     = (mins > 0 && distancia > 0)
    ? `${minutesToPace(mins, distancia)} min/km`
    : '—';

  // Emojis para claridad
  const EMOJI_INTENSIDAD = { baja:'🟢', media:'🟡', alta:'🔴' };
  const EMOJI_EMO = {
    feliz:'😀', cansada:'😣', tranquila:'😌',
    ansiosa:'😬', frustrada:'😕', conenergia:'⚡'
  };

  // clases css
  const normInt = normalizarClase(intensidad);
  const normEmo = normalizarClase(emociones);
  const normCic = normalizarClase(ciclo);

  const chipInt = `<span class="chip chip--${normInt}" title="Intensidad">${EMOJI_INTENSIDAD[normInt] || '🏁'} ${intensidad}</span>`;
  const chipEmo = `<span class="chip chip--${normEmo}" title="Estado de ánimo">${EMOJI_EMO[normEmo] || '🙂'} ${emociones}</span>`;
  const chipCic = ciclo ? `<span class="chip chip--${normCic}" title="Fase del ciclo">${ciclo}</span>` : '';

  const li = document.createElement('li');
  li.innerHTML = `
    <div class="item-header">
      <div class="item-title">${e.tipo || '-'} · ${distancia.toFixed(2)} km</div>
      <div class="chips">
        ${chipInt}
        ${chipEmo}
        ${chipCic}
      </div>
    </div>

    <div class="kv">
      <span><strong>Fecha:</strong> ${fechaFmt}</span>
      <span><strong>Duración:</strong> ${duracion}</span>
      <span><strong>Pace:</strong> ${pace}</span>
      <span><strong>Comentarios:</strong> ${comentarios}</span>
      ${alim ? `<span><strong>Alimentación:</strong> ${alim}</span>` : ''}
      <!-- No duplicamos "Ciclo:" aquí: queda solo como chip -->
    </div>

    <div class="card-actions">
      <button type="button" class="btn-delete" data-id="${e.id ?? ''}">Eliminar</button>
      <button type="button" class="btn-edit"   data-id="${e.id ?? ''}">Editar</button>
    </div>
  `;

  li.querySelector('.btn-edit')?.addEventListener('click', () => onEdit?.(e));
  li.querySelector('.btn-delete')?.addEventListener('click', () => onDelete?.(e));

  return li;
}

// Lista completa (recibe datos desde data-layer)
// ui/render.js (firma mínima que usa index.js)
export function renderEntradas(entradas = [], opts = {}) {
  const lista = document.getElementById('listaEntradas');
  const vacio = document.getElementById('vacio');
  if (!lista) return;

  lista.innerHTML = '';

  if (!Array.isArray(entradas) || entradas.length === 0) {
    if (vacio) vacio.style.display = 'block';
    return;
  }
  if (vacio) vacio.style.display = 'none';
  
  // Resumen
  lista.appendChild(renderResumen(entradas));

  // Orden por fecha ascendente
  const ordenadas = entradas.slice().sort((a, b) => {
    const af = a.fecha || '';
    const bf = b.fecha || '';
    return af.localeCompare(bf);
  });

  ordenadas.forEach(e => lista.appendChild(renderEntradaItem(e, opts)));
}

/* -------- Compatibilidad con la versión vieja (window.*) -------- */
if (typeof window !== 'undefined') {
  window.UIRender = {
    setOrigen,
    renderResumen,
    renderEntradaItem,
    renderEntradas
  };
}
