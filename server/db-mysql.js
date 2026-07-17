import 'dotenv/config';
import mysql from 'mysql2/promise';

const requiredEnv = ['MYSQL_USER', 'MYSQL_PASS', 'MYSQL_DB'];
const missingEnv = requiredEnv.filter((name) => process.env[name] === undefined);

if (missingEnv.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingEnv.join(', ')}. ` +
    'Copiá server/.env.example como server/.env y completá sus valores.'
  );
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

function nil(value) {
  return value === '' || value === undefined ? null : value;
}

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    fecha: row.fecha ? String(row.fecha).slice(0, 10) : null,
    created_at: row.created_at ? String(row.created_at).replace('T', ' ').slice(0, 19) : null
  };
}

export async function ping() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows?.[0]?.ok === 1;
}

export async function listEntrenamientos(limit = 100, offset = 0) {
  const [items] = await pool.query(
    `SELECT id, fecha, tipo, distancia_km, duracion, intensidad, sentimiento,
            descripcion, ciclo_menstrual, alimentacion_previa, created_at
       FROM entrenamientos
      ORDER BY fecha DESC, id DESC
      LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ c: total }]] = await pool.query('SELECT COUNT(*) AS c FROM entrenamientos');
  return { items: items.map(normalize), total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT id, fecha, tipo, distancia_km, duracion, intensidad, sentimiento,
            descripcion, ciclo_menstrual, alimentacion_previa, created_at
       FROM entrenamientos
      WHERE id = ?`,
    [id]
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function insertEntrada(entry) {
  const [info] = await pool.query(
    `INSERT INTO entrenamientos
       (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion,
        ciclo_menstrual, alimentacion_previa, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      entry.fecha,
      entry.tipo,
      entry.distancia_km,
      entry.duracion,
      nil(entry.intensidad),
      nil(entry.sentimiento),
      nil(entry.descripcion),
      nil(entry.ciclo_menstrual),
      nil(entry.alimentacion_previa)
    ]
  );
  return getById(info.insertId);
}

export async function updateEntrada(id, entry) {
  await pool.query(
    `UPDATE entrenamientos
        SET fecha = ?, tipo = ?, distancia_km = ?, duracion = ?, intensidad = ?,
            sentimiento = ?, descripcion = ?, ciclo_menstrual = ?, alimentacion_previa = ?
      WHERE id = ?`,
    [
      entry.fecha,
      entry.tipo,
      entry.distancia_km,
      entry.duracion,
      nil(entry.intensidad),
      nil(entry.sentimiento),
      nil(entry.descripcion),
      nil(entry.ciclo_menstrual),
      nil(entry.alimentacion_previa),
      id
    ]
  );
  return getById(id);
}

export async function deleteEntrada(id) {
  const [info] = await pool.query('DELETE FROM entrenamientos WHERE id = ?', [id]);
  return { ok: info.affectedRows > 0 };
}
