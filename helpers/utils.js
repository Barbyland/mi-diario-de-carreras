export function parseDurationToMinutes(value) {
  if (!value || typeof value !== 'string') return 0;
  const parts = value.trim().split(':').map(Number);
  if (![2, 3].includes(parts.length) || parts.some((part) => !Number.isFinite(part))) return 0;

  const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, ...parts];
  if (minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60 || hours < 0) return 0;
  return hours * 60 + minutes + seconds / 60;
}

export function minutesToPace(minutes, distanceKm) {
  if (!Number.isFinite(minutes) || !Number.isFinite(distanceKm) || minutes <= 0 || distanceKm <= 0) {
    return '0:00';
  }
  const totalSeconds = Math.round((minutes / distanceKm) * 60);
  const paceMinutes = Math.floor(totalSeconds / 60);
  const paceSeconds = totalSeconds % 60;
  return `${paceMinutes}:${String(paceSeconds).padStart(2, '0')}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function toHHMMSS(input) {
  if (!input || typeof input !== 'string') return null;
  const parts = input.split(':').map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;

  if (parts.length === 2) {
    const [totalMinutes, seconds] = parts;
    if (seconds >= 60) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (minutes >= 60 || seconds >= 60) return null;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  return null;
}

export const byId = (id) => document.getElementById(id);
