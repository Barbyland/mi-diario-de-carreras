CREATE DATABASE IF NOT EXISTS mi_diario_carreras
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mi_diario_carreras;

CREATE TABLE IF NOT EXISTS entrenamientos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  distancia_km DECIMAL(7,2) UNSIGNED NOT NULL,
  duracion TIME NOT NULL,
  intensidad VARCHAR(50) NULL,
  sentimiento VARCHAR(100) NULL,
  descripcion TEXT NULL,
  ciclo_menstrual VARCHAR(50) NULL,
  alimentacion_previa VARCHAR(150) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entrenamientos_fecha (fecha),
  INDEX idx_entrenamientos_tipo (tipo)
);
