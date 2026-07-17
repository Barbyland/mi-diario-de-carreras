import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDurationToMinutes, minutesToPace, toHHMMSS, formatDate } from '../helpers/utils.js';

test('convierte duraciones válidas a minutos', () => {
  assert.equal(parseDurationToMinutes('00:30:00'), 30);
  assert.equal(parseDurationToMinutes('01:15:30'), 75.5);
});

test('rechaza minutos o segundos fuera de rango', () => {
  assert.equal(parseDurationToMinutes('00:70:00'), 0);
  assert.equal(parseDurationToMinutes('00:10:99'), 0);
  assert.equal(parseDurationToMinutes('texto'), 0);
});

test('normaliza MM:SS y HH:MM:SS', () => {
  assert.equal(toHHMMSS('90:00'), '01:30:00');
  assert.equal(toHHMMSS('01:05:09'), '01:05:09');
  assert.equal(toHHMMSS('10:99'), null);
});

test('calcula pace sin producir segundos 60', () => {
  assert.equal(minutesToPace(30, 5), '6:00');
  assert.equal(minutesToPace(29.999, 5), '6:00');
  assert.equal(minutesToPace(0, 5), '0:00');
});

test('formatea fechas ISO sin alterar la zona horaria', () => {
  assert.equal(formatDate('2026-07-16'), '16/07/2026');
});
