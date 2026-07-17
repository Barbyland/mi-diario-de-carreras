import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidDate, isValidDuration, parseId, validateEntry } from '../validation.js';

const validEntry = {
  fecha: '2026-07-16',
  tipo: 'Running',
  distancia_km: 10,
  duracion: '00:55:30',
  intensidad: 'Media',
  sentimiento: 'Con energía',
  descripcion: 'Fondo progresivo',
  ciclo_menstrual: 'Folicular',
  alimentacion_previa: 'Banana y agua'
};

test('acepta una entrada completa y conserva los campos opcionales', () => {
  const { entry, errors } = validateEntry(validEntry);
  assert.deepEqual(errors, []);
  assert.equal(entry.ciclo_menstrual, 'Folicular');
  assert.equal(entry.alimentacion_previa, 'Banana y agua');
});

test('rechaza datos fuera del contrato de la API', () => {
  const { errors } = validateEntry({
    ...validEntry,
    fecha: '2026-02-30',
    tipo: 'Natación',
    distancia_km: 0,
    duracion: '00:70:00'
  });
  assert.equal(errors.length, 4);
});

test('valida fechas, duraciones e identificadores', () => {
  assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidDate('2025-02-29'), false);
  assert.equal(isValidDuration('12:59:59'), true);
  assert.equal(isValidDuration('12:60:00'), false);
  assert.equal(parseId('15'), 15);
  assert.equal(parseId('-2'), null);
});
