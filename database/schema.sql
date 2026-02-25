-- ============================================
-- ParkSystem Pro — Schema MySQL
-- Compatible con XAMPP / phpMyAdmin / MySQL 5.7+
-- ============================================

CREATE DATABASE IF NOT EXISTS parksystem_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parksystem_pro;

-- Configuración general
CREATE TABLE IF NOT EXISTS configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tarifas por tipo de vehículo y tipo de cobro
CREATE TABLE IF NOT EXISTS tarifas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
  tipo_cobro ENUM('hora', 'dia', 'noche', '24h', 'mensual') NOT NULL,
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tarifa (tipo_vehiculo, tipo_cobro)
) ENGINE=InnoDB;

-- Registro maestro de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(6) NOT NULL,
  tipo ENUM('carro', 'moto') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_placa (placa)
) ENGINE=InnoDB;

-- Entradas de vehículos
CREATE TABLE IF NOT EXISTS ingresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(6) NOT NULL,
  tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
  tipo_cobro ENUM('hora', 'dia', 'noche', '24h') NOT NULL DEFAULT 'hora',
  espacio VARCHAR(10) NOT NULL,
  ticket_code VARCHAR(20) NOT NULL,
  numero_casco VARCHAR(50) DEFAULT NULL COMMENT 'Solo para motos',
  fecha_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activo', 'finalizado') NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_placa_estado (placa, estado),
  INDEX idx_fecha (fecha_entrada)
) ENGINE=InnoDB;

-- Salidas de vehículos
CREATE TABLE IF NOT EXISTS salidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingreso_id INT NOT NULL,
  placa VARCHAR(6) NOT NULL,
  tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
  tipo_cobro ENUM('hora', 'dia', 'noche', '24h') NOT NULL,
  fecha_entrada DATETIME NOT NULL,
  fecha_salida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duracion_minutos INT NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  convenio TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE CASCADE,
  INDEX idx_fecha_salida (fecha_salida)
) ENGINE=InnoDB;

-- Pagos realizados
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  salida_id INT DEFAULT NULL,
  mensualidad_pago_id INT DEFAULT NULL,
  placa VARCHAR(6) NOT NULL,
  tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
  tipo_cobro ENUM('hora', 'dia', 'noche', '24h', 'mensual') NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL DEFAULT 'efectivo',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  convenio TINYINT(1) NOT NULL DEFAULT 0,
  estado ENUM('pagado', 'pendiente') NOT NULL DEFAULT 'pagado',
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salida_id) REFERENCES salidas(id) ON DELETE SET NULL,
  INDEX idx_fecha_pago (fecha_pago),
  INDEX idx_placa (placa)
) ENGINE=InnoDB;

-- Mensualidades (suscripciones mensuales)
CREATE TABLE IF NOT EXISTS mensualidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(6) NOT NULL,
  nombre_cliente VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) DEFAULT '',
  tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
  fecha_inicio DATE NOT NULL,
  dia_corte TINYINT NOT NULL DEFAULT 1 COMMENT 'Día del mes para corte (1-31)',
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,
  estado ENUM('activo', 'pendiente') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_placa (placa),
  INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- Historial de pagos de mensualidades
CREATE TABLE IF NOT EXISTS mensualidad_pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mensualidad_id INT NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  mes_pagado TINYINT NOT NULL COMMENT 'Mes (1-12)',
  anio_pagado SMALLINT NOT NULL COMMENT 'Año',
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mensualidad_id) REFERENCES mensualidades(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pago_mes (mensualidad_id, mes_pagado, anio_pagado),
  INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB;

-- FK pagos → mensualidad_pagos
ALTER TABLE pagos ADD CONSTRAINT fk_mensualidad_pago
  FOREIGN KEY (mensualidad_pago_id) REFERENCES mensualidad_pagos(id) ON DELETE SET NULL;
