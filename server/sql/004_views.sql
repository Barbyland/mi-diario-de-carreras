/* ============================================
   VISTAS – Mi Diario de Carreras
   BD: mi_diario_carreras
   ============================================ */

USE mi_diario_carreras;

/* Limpieza por si ya existen */
DROP VIEW IF EXISTS vw_kpis_globales;
DROP VIEW IF EXISTS vw_por_tipo;
DROP VIEW IF EXISTS vw_por_mes;
DROP VIEW IF EXISTS vw_pace_por_sesion;
DROP VIEW IF EXISTS vw_semana_iso;
DROP VIEW IF EXISTS vw_running_kpis;

/* ---------- 1) KPIs globales ---------- */
CREATE VIEW vw_kpis_globales AS
SELECT
  COALESCE(SUM(distancia_km), 0)                                         AS total_km,
  COUNT(*)                                                                AS sesiones,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion)))                                 AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km),0))) AS pace_promedio
FROM entrenamientos;

/* ---------- 2) Resumen por tipo ---------- */
CREATE VIEW vw_por_tipo AS
SELECT
  tipo,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km),0))) AS pace_promedio
FROM entrenamientos
GROUP BY tipo
ORDER BY km DESC;

/* ---------- 3) Resumen por mes (YYYY-MM) ---------- */
CREATE VIEW vw_por_mes AS
SELECT
  DATE_FORMAT(fecha, '%Y-%m') AS mes,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km),0))) AS pace_promedio
FROM entrenamientos
GROUP BY mes
ORDER BY mes;

/* ---------- 4) Pace por sesión ---------- */
CREATE VIEW vw_pace_por_sesion AS
SELECT
  id,
  fecha,
  tipo,
  distancia_km,
  duracion,
  SEC_TO_TIME(ROUND(TIME_TO_SEC(duracion) / NULLIF(distancia_km,0))) AS pace,
  intensidad,
  sentimiento,
  descripcion
FROM entrenamientos;

/* ---------- 5) Resumen semanal (ISO: lunes-domingo) ---------- */
CREATE VIEW vw_semana_iso AS
SELECT
  YEARWEEK(fecha, 3) AS semana_iso,
  MIN(fecha) AS desde,
  MAX(fecha) AS hasta,
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km),0))) AS pace_promedio
FROM entrenamientos
GROUP BY semana_iso
ORDER BY semana_iso;

/* ---------- 6) KPIs solo Running ---------- */
CREATE VIEW vw_running_kpis AS
SELECT
  COUNT(*) AS sesiones,
  SUM(distancia_km) AS km,
  SEC_TO_TIME(SUM(TIME_TO_SEC(duracion))) AS tiempo_total,
  SEC_TO_TIME(ROUND(SUM(TIME_TO_SEC(duracion)) / NULLIF(SUM(distancia_km),0))) AS pace_promedio
FROM entrenamientos
WHERE tipo = 'Running';
