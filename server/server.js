import 'dotenv/config';
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
import { parsePositiveInteger, parseId, validateEntry } from './validation.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:5500,http://localhost:5500')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  }
}));
app.use(express.json({ limit: '50kb' }));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  const ok = await ping();
  res.json({ ok, db: 'mysql' });
}));

app.get('/api/entrenamientos', asyncRoute(async (req, res) => {
  const limit = parsePositiveInteger(req.query.limit, 100, 500);
  const offset = parsePositiveInteger(req.query.offset, 0, 1_000_000);
  res.json(await listEntrenamientos(limit, offset));
}));

app.get('/api/entrenamientos/:id', asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const row = await getById(id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  return res.json(row);
}));

app.post('/api/entrenamientos', asyncRoute(async (req, res) => {
  const { entry, errors } = validateEntry(req.body || {});
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });
  return res.status(201).json(await insertEntrada(entry));
}));

app.put('/api/entrenamientos/:id', asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const current = await getById(id);
  if (!current) return res.status(404).json({ error: 'No encontrado' });

  const { entry, errors } = validateEntry({ ...current, ...req.body });
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });
  return res.json(await updateEntrada(id, entry));
}));

app.delete('/api/entrenamientos/:id', asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const result = await deleteEntrada(id);
  if (!result.ok) return res.status(404).json({ error: 'No encontrado' });
  return res.status(204).end();
}));

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.message === 'Origen no permitido por CORS' ? 403 : 500;
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : error.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`API MySQL disponible en http://localhost:${PORT}`));
}

export { app };
