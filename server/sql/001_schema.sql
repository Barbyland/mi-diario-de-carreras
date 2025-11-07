USE mi_diario_carreras;

CREATE TABLE IF NOT EXISTS entrenamientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  distancia_km DECIMAL(5,2) NOT NULL,
  duracion TIME NOT NULL,
  intensidad VARCHAR(50) NULL,
  sentimiento VARCHAR(100) NULL,
  descripcion TEXT NULL,
  ciclo_menstrual VARCHAR(50) NULL,
  alimentacion_previa VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

