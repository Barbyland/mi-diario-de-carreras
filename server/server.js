// server/server.js
import express from 'express';
import cors from 'cors';
import {
  listEntrenamientos,
  insertEntrada,
  updateEntrada,
  deleteEntrada,
  getById,
  ping
} from './db-mysql.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', async (_req, res) => {
  try {
    const ok = await ping();
    res.json({ ok, db: 'mysql' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// Listar con paginado
app.get('/api/entrenamientos', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '100', 10), 500);
    const offset = Math.max(parseInt(req.query.offset || '0',   10), 0);
    const data = await listEntrenamientos(limit, offset);
    res.json(data); // { items, total }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Obtener por id
app.get('/api/entrenamientos/:id', async (req, res) => {
  const row = await getById(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

// Crear
app.post('/api/entrenamientos', async (req, res) => {
  const e = req.body || {};
  if (!e.fecha || !e.tipo) {
    return res.status(400).json({ error: 'fecha y tipo son obligatorios' });
  }
  const saved = await insertEntrada({
    fecha: e.fecha,
    tipo: e.tipo,
    distancia_km: Number(e.distancia_km || 0),
    duracion: e.duracion || '00:00:00',
    intensidad: e.intensidad || '',
    sentimiento: e.sentimiento || '',
    descripcion: e.descripcion || ''
  });
  res.status(201).json(saved);
});

// Actualizar
app.put('/api/entrenamientos/:id', async (req, res) => {
  const id = req.params.id;
  const current = await getById(id);
  if (!current) return res.status(404).json({ error: 'No encontrado' });

  const e = { ...current, ...req.body };
  const saved = await updateEntrada(id, {
    fecha: e.fecha,
    tipo: e.tipo,
    distancia_km: Number(e.distancia_km || 0),
    duracion: e.duracion || '00:00:00',
    intensidad: e.intensidad || '',
    sentimiento: e.sentimiento || '',
    descripcion: e.descripcion || ''
  });
  res.json(saved);
});

// Borrar
app.delete('/api/entrenamientos/:id', async (req, res) => {
  const out = await deleteEntrada(req.params.id);
  res.json(out); // { ok: true/false }
});

app.listen(PORT, () => console.log(`API MySQL en http://localhost:${PORT}`));
