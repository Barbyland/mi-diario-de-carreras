import mysql from 'mysql2/promise';

/* ==============================
   Pool / credenciales
   ============================== */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || 'Barby2024!',
  database: process.env.MYSQL_DB || 'mi_diario_carreras',
  waitForConnections: true,
  connectionLimit: 10
});

/* ==============================
   Helpers
   ============================== */

// Convierte '' → null para columnas opcionales
function nil(v) {
  return v === '' || v === undefined ? null : v;
}

// Normaliza fechas a formatos amigables para el front
function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    // fecha → 'YYYY-MM-DD'
    fecha: row.fecha
      ? new Date(row.fecha).toISOString().split('T')[0]
      : null,
    // created_at → 'YYYY-MM-DD HH:mm:ss'
    created_at: row.created_at
      ? new Date(row.created_at).toISOString().replace('T', ' ').split('.')[0]
      : null
  };
}

/* ==============================
   Ping de salud
   ============================== */
export async function ping() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows?.[0]?.ok === 1;
}

/* ==============================
   Listado / lectura
   ============================== */
export async function listEntrenamientos(limit = 100, offset = 0) {
  const [items] = await pool.query(
    `SELECT
       id,
       fecha,
       tipo,
       distancia_km,
       duracion,
       intensidad,
       sentimiento,
       descripcion,
       ciclo_menstrual,
       alimentacion_previa,
       created_at
     FROM entrenamientos
     ORDER BY fecha DESC, id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ c: total }]] = await pool.query(
    `SELECT COUNT(*) AS c FROM entrenamientos`
  );
  return { items: items.map(normalize), total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT
       id,
       fecha,
       tipo,
       distancia_km,
       duracion,
       intensidad,
       sentimiento,
       descripcion,
       ciclo_menstrual,
       alimentacion_previa,
       created_at
     FROM entrenamientos
     WHERE id = ?`,
    [id]
  );
  return rows[0] ? normalize(rows[0]) : null;
}

/* ==============================
   Altas / modificaciones / bajas
   ============================== */
export async function insertEntrada(e) {
  const [info] = await pool.query(
    `INSERT INTO entrenamientos
       (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion,
        ciclo_menstrual, alimentacion_previa, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      e.fecha,
      e.tipo,
      e.distancia_km,
      e.duracion,
      nil(e.intensidad),
      nil(e.sentimiento),
      nil(e.descripcion),
      nil(e.ciclo_menstrual),           // ← NUEVO
      nil(e.alimentacion_previa)   // ← NUEVO
    ]
  );
  return await getById(info.insertId);
}

export async function updateEntrada(id, e) {
  await pool.query(
    `UPDATE entrenamientos
        SET fecha=?,
            tipo=?,
            distancia_km=?,
            duracion=?,
            intensidad=?,
            sentimiento=?,
            descripcion=?,
            ciclo_menstrual=?,
            alimentacion_previa=?
      WHERE id=?`,
    [
      e.fecha,
      e.tipo,
      e.distancia_km,
      e.duracion,
      nil(e.intensidad),
      nil(e.sentimiento),
      nil(e.descripcion),
      nil(e.ciclo_menstrual),           // ← NUEVO
      nil(e.alimentacion_previa),  // ← NUEVO
      id
    ]
  );
  return await getById(id);
}

export async function deleteEntrada(id) {
  const [info] = await pool.query(
    `DELETE FROM entrenamientos WHERE id = ?`,
    [id]
  );
  return { ok: info.affectedRows > 0 };
}
