import { formatDate, parseDurationToMinutes, minutesToPace } from '../helpers/utils.js';

function normalizeClass(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
}

function createChip(text, kind, title) {
  const chip = createElement('span', `chip chip--${normalizeClass(kind)}`, text);
  chip.title = title;
  return chip;
}

function createDataItem(label, value) {
  const item = createElement('span');
  const strong = createElement('strong', '', `${label}: `);
  item.append(strong, document.createTextNode(String(value ?? '')));
  return item;
}

export function renderResumen(entries) {
  const totalKm = entries.reduce((total, entry) => {
    const distance = Number(entry.distancia ?? entry.distancia_km ?? 0);
    return total + (Number.isFinite(distance) ? distance : 0);
  }, 0);

  const item = createElement('li', 'resumen');
  item.append(
    createElement('strong', '', 'Total km:'),
    document.createTextNode(` ${totalKm.toFixed(2)} · `),
    createElement('strong', '', 'Entradas:'),
    document.createTextNode(` ${entries.length}`)
  );
  return item;
}

export function renderEntradaItem(entry, { onEdit, onDelete } = {}) {
  const distance = Number(entry.distancia ?? entry.distancia_km ?? 0);
  const duration = entry.duracion || '—';
  const intensity = entry.intensidad || 'Sin indicar';
  const emotion = entry.emociones ?? entry.sentimiento ?? 'Sin indicar';
  const cycle = entry.ciclo_menstrual || '';
  const food = entry.alimentacion_previa || '';
  const comments = entry.comentarios ?? entry.descripcion ?? '';
  const minutes = parseDurationToMinutes(duration);
  const pace = minutes > 0 && distance > 0 ? `${minutesToPace(minutes, distance)} min/km` : '—';

  const item = createElement('li', 'entry-card');
  const header = createElement('div', 'item-header');
  header.appendChild(createElement('div', 'item-title', `${entry.tipo || 'Actividad'} · ${distance.toFixed(2)} km`));

  const chips = createElement('div', 'chips');
  const intensityEmoji = { baja: '🟢', media: '🟡', alta: '🔴' }[normalizeClass(intensity)] || '🏁';
  const emotionEmoji = {
    feliz: '😀', cansada: '😣', tranquila: '😌', ansiosa: '😬', frustrada: '😕', conenergia: '⚡'
  }[normalizeClass(emotion)] || '🙂';
  chips.append(
    createChip(`${intensityEmoji} ${intensity}`, intensity, 'Intensidad'),
    createChip(`${emotionEmoji} ${emotion}`, emotion, 'Estado de ánimo')
  );
  if (cycle) chips.appendChild(createChip(cycle === 'Lutea' ? 'Lútea' : cycle, cycle, 'Fase del ciclo'));
  header.appendChild(chips);

  const details = createElement('div', 'kv');
  details.append(
    createDataItem('Fecha', formatDate(entry.fecha) || entry.fecha || '—'),
    createDataItem('Duración', duration),
    createDataItem('Pace', pace),
    createDataItem('Comentarios', comments || 'Sin comentarios')
  );
  if (food) details.appendChild(createDataItem('Alimentación', food));

  const actions = createElement('div', 'card-actions');
  const deleteButton = createElement('button', 'btn-delete', 'Eliminar');
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Eliminar registro de ${entry.tipo || 'actividad'} del ${formatDate(entry.fecha)}`);
  let deletePending = false;
  const resetDeleteButton = () => {
    deletePending = false;
    deleteButton.textContent = 'Eliminar';
    deleteButton.classList.remove('btn-delete--confirm');
    deleteButton.setAttribute('aria-label', `Eliminar registro de ${entry.tipo || 'actividad'} del ${formatDate(entry.fecha)}`);
  };
  deleteButton.addEventListener('click', () => {
    if (!deletePending) {
      deletePending = true;
      deleteButton.textContent = 'Confirmar eliminación';
      deleteButton.classList.add('btn-delete--confirm');
      deleteButton.setAttribute('aria-label', `Confirmar eliminación del registro de ${entry.tipo || 'actividad'} del ${formatDate(entry.fecha)}`);
      return;
    }
    onDelete?.(entry);
  });
  deleteButton.addEventListener('blur', resetDeleteButton);

  const editButton = createElement('button', 'btn-edit', 'Editar');
  editButton.type = 'button';
  editButton.setAttribute('aria-label', `Editar registro de ${entry.tipo || 'actividad'} del ${formatDate(entry.fecha)}`);
  editButton.addEventListener('click', () => onEdit?.(entry));
  actions.append(deleteButton, editButton);

  item.append(header, details, actions);
  return item;
}

export function renderEntradas(entries = [], options = {}) {
  const list = document.getElementById('listaEntradas');
  const empty = document.getElementById('vacio');
  if (!list) return;

  list.replaceChildren();
  if (!Array.isArray(entries) || entries.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  list.appendChild(renderResumen(entries));
  [...entries]
    .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
    .forEach((entry) => list.appendChild(renderEntradaItem(entry, options)));
}
