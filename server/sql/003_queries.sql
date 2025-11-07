/* ============================================
   CONSULTAS ÚTILES – Mi Diario de Carreras
   BD: mi_diario_carreras
   Tabla: entrenamientos
   ============================================ */

USE mi_diario_carreras;

/* ---------- 1) Totales globales ---------- */
-- Total de kilómetros
SELECT COALESCE(SUM(distancia_km), 0) AS total_km
FROM entrenamientos;

-- Cantidad de sesiones
SELECT COUNT(*) AS sesiones
FROM entrenamientos;

-- Tiempo total acumulado (en formato HH:MM:SS)
SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total
FROM entrenamientos;

-- Pace promedio global (tiempo por km, mm:ss)
-- (dividimos los segundos totales por los km totales)
SELECT SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km), 0))) AS pace_promedio
FROM entrenamientos;

/* ---------- 2) Totales por tipo de actividad ---------- */
SELECT
  tipo,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km), 0))) AS pace_promedio
FROM entrenamientos
GROUP BY tipo
ORDER BY km DESC;

/* ---------- 3) Totales por mes (año-mes) ---------- */
SELECT
  DATE_FORMAT(fecha, '%Y-%m') AS mes,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total
FROM entrenamientos
GROUP BY mes
ORDER BY mes;

/* ---------- 4) Distribución por intensidad y por sentimiento ---------- */
-- Intensidad
SELECT intensidad, COUNT(*) AS cantidad
FROM entrenamientos
GROUP BY intensidad
ORDER BY cantidad DESC;

-- Sentimiento
SELECT sentimiento, COUNT(*) AS cantidad
FROM entrenamientos
GROUP BY sentimiento
ORDER BY cantidad DESC;

/* ---------- 5) Pace por sesión (columna calculada) ---------- */
SELECT
  id,
  fecha,
  tipo,
  distancia_km,
  duracion,
  SEC_TO_TIME(ROUND(TIME_TO_SEC(duracion) / NULLIF(distancia_km, 0))) AS pace
FROM entrenamientos
ORDER BY fecha DESC, id DESC;

/* ---------- 6) Mejores paces por tipo ---------- */
SELECT
  tipo,
  SEC_TO_TIME(MIN(TIME_TO_SEC(duracion) / NULLIF(distancia_km, 0))) AS mejor_pace
FROM entrenamientos
GROUP BY tipo;

/* ---------- 7) Top 5 entrenamientos por distancia ---------- */
SELECT
  id, fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion
FROM entrenamientos
ORDER BY distancia_km DESC
LIMIT 5;

/* ---------- 8) Últimas 10 sesiones ---------- */
SELECT
  id, fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion
FROM entrenamientos
ORDER BY fecha DESC, id DESC
LIMIT 10;

/* ---------- 9) Resumen semanal (ISO) ---------- */
-- YEARWEEK(fecha, 3) usa semana ISO (lunes a domingo)
SELECT
  YEARWEEK(fecha, 3) AS semana_iso,
  MIN(fecha) AS desde,
  MAX(fecha) AS hasta,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total
FROM entrenamientos
GROUP BY semana_iso
ORDER BY semana_iso;

/* ---------- 10) Filtro entre fechas (ejemplo parametrizable) ---------- */
/* Reemplazá los valores por tu rango deseado */
SELECT
  id, fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion,
  SEC_TO_TIME(ROUND(TIME_TO_SEC(duracion) / NULLIF(distancia_km, 0))) AS pace
FROM entrenamientos
WHERE fecha BETWEEN '2025-06-01' AND '2025-06-30'
ORDER BY fecha, id;

/* ---------- 11) Solo Running – KPIs rápidos ---------- */
SELECT
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km), 0))) AS pace_promedio
FROM entrenamientos
WHERE tipo = 'Running';
