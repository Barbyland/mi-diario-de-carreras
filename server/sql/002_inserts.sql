-- Inserts de ejemplo
INSERT INTO entrenamientos 
  (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion, ciclo_menstrual, alimentacion_previa, created_at)
VALUES
('2025-09-21','Running',42.00,'04:58:13','Alta','Feliz','Mi 3ra Maratón.','Lutea','Banana y café','2025-09-21 09:00:00');

-- Ejemplo 1: Fondo largo en fase lútea
INSERT INTO entrenamientos
  (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion, ciclo_menstrual, alimentacion_previa, created_at)
VALUES
  ('2025-09-21','Running',32.00,'03:12:45','Media','Cansada','Fondo de domingo, humedad alta','Lutea','Tostadas con miel y té','2025-09-21 08:30:00');

-- Ejemplo 2: Rodaje regenerativo en fase folicular
INSERT INTO entrenamientos
  (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion, ciclo_menstrual, alimentacion_previa, created_at)
VALUES
  ('2025-09-25','Running',8.50,'00:52:10','Baja','Tranquila','Rodaje regenerativo post maratón','Folicular','Banana + café','2025-09-25 07:00:00');

-- Ejemplo 3: Entrenamiento de bici con fuerza
INSERT INTO entrenamientos
  (fecha, tipo, distancia_km, duracion, intensidad, sentimiento, descripcion, ciclo_menstrual, alimentacion_previa, created_at)
VALUES
  ('2025-09-28','Bicicleta',65.00,'02:45:00','Alta','Con energia','Trabajo de fuerza en subida, 3 horas en ruta','Ovulatoria','Sandwich de jamón y queso + isotónica','2025-09-28 09:00:00');

