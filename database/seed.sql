-- ============================================
-- ParkSystem Pro — Datos Iniciales (Seed)
-- Archivo: seed.sql
-- Ejecutar DESPUÉS de schema.sql
-- ============================================

USE parksystem_pro;

-- ──────────────────────────────────────────────
-- Configuración general
-- ──────────────────────────────────────────────
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_parqueadero', 'ParkSystem Pro', 'Nombre del parqueadero'),
('moneda', 'COP', 'Código de moneda'),
('tiempo_gracia', '5', 'Minutos de gracia después de cada hora'),
('total_espacios_carro', '20', 'Total de espacios para carros'),
('total_espacios_moto', '10', 'Total de espacios para motos'),
('total_espacios_camioneta', '5', 'Total de espacios para camionetas'),
('recibo_encabezado', 'ParkSystem Pro', 'Texto encabezado de recibos'),
('recibo_pie', 'Gracias por su visita', 'Texto pie de recibos'),
('recibo_logo_url', '', 'URL del logo para recibos'),
('recibo_ancho_mm', '80', 'Ancho del recibo en milímetros');

-- ──────────────────────────────────────────────
-- Tarifas por defecto
-- ──────────────────────────────────────────────
INSERT INTO tarifas (tipo_vehiculo, tipo_cobro, precio) VALUES
-- Carro
('carro', 'hora', 5000.00),
('carro', 'dia', 25000.00),
('carro', 'noche', 15000.00),
('carro', '24h', 35000.00),
('carro', 'mensual', 250000.00),
-- Moto
('moto', 'hora', 3000.00),
('moto', 'dia', 15000.00),
('moto', 'noche', 10000.00),
('moto', '24h', 20000.00),
('moto', 'mensual', 150000.00),
-- Camioneta
('camioneta', 'hora', 8000.00),
('camioneta', 'dia', 40000.00),
('camioneta', 'noche', 25000.00),
('camioneta', '24h', 50000.00),
('camioneta', 'mensual', 400000.00);

-- ──────────────────────────────────────────────
-- Datos de ejemplo (opcional)
-- ──────────────────────────────────────────────

-- Mensualidad de ejemplo
INSERT INTO mensualidades (placa, nombre_cliente, tipo_vehiculo, fecha_inicio, dia_corte, precio, estado)
VALUES ('ABC123', 'Juan Pérez', 'carro', CURDATE(), 1, 250000.00, 'activo');

-- Ingreso de ejemplo
INSERT INTO ingresos (placa, tipo_vehiculo, tipo_cobro, espacio, ticket_code, fecha_entrada, estado)
VALUES ('XYZ789', 'carro', 'hora', 'C01', 'PKS-DEMO0001', NOW(), 'activo');
