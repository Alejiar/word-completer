
-- Configuración general del parqueadero
CREATE TABLE public.configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tarifas por tipo de vehículo y tipo de cobro
CREATE TABLE public.tarifas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('carro', 'moto')),
  tipo_cobro TEXT NOT NULL CHECK (tipo_cobro IN ('hora', 'dia', 'noche', '24h', 'mensual')),
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tipo_vehiculo, tipo_cobro)
);

-- Registro maestro de vehículos
CREATE TABLE public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('carro', 'moto')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Entradas de vehículos
CREATE TABLE public.ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL,
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('carro', 'moto')),
  tipo_cobro TEXT NOT NULL DEFAULT 'hora' CHECK (tipo_cobro IN ('hora', 'dia', 'noche', '24h')),
  espacio TEXT NOT NULL,
  ticket_code TEXT NOT NULL,
  numero_casco TEXT DEFAULT NULL,
  fecha_entrada TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Salidas de vehículos
CREATE TABLE public.salidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingreso_id UUID NOT NULL REFERENCES public.ingresos(id) ON DELETE CASCADE,
  placa TEXT NOT NULL,
  tipo_vehiculo TEXT NOT NULL,
  tipo_cobro TEXT NOT NULL,
  fecha_entrada TIMESTAMPTZ NOT NULL,
  fecha_salida TIMESTAMPTZ NOT NULL DEFAULT now(),
  duracion_minutos INT NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  convenio BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagos realizados
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salida_id UUID REFERENCES public.salidas(id) ON DELETE SET NULL,
  mensualidad_pago_id UUID DEFAULT NULL,
  placa TEXT NOT NULL,
  tipo_vehiculo TEXT NOT NULL,
  tipo_cobro TEXT NOT NULL,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  convenio BOOLEAN NOT NULL DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente')),
  fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mensualidades (suscripciones mensuales)
CREATE TABLE public.mensualidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('carro', 'moto')),
  fecha_inicio DATE NOT NULL,
  dia_corte INT NOT NULL DEFAULT 1,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('activo', 'pendiente')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de pagos de mensualidades
CREATE TABLE public.mensualidad_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensualidad_id UUID NOT NULL REFERENCES public.mensualidades(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL,
  mes_pagado INT NOT NULL,
  anio_pagado INT NOT NULL,
  fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mensualidad_id, mes_pagado, anio_pagado)
);

-- FK de pagos hacia mensualidad_pagos
ALTER TABLE public.pagos ADD CONSTRAINT fk_mensualidad_pago
  FOREIGN KEY (mensualidad_pago_id) REFERENCES public.mensualidad_pagos(id) ON DELETE SET NULL;

-- Disable RLS for internal parking system (no user auth needed)
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensualidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensualidad_pagos ENABLE ROW LEVEL SECURITY;

-- Public access policies (internal system, no auth required)
CREATE POLICY "Allow all on configuracion" ON public.configuracion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tarifas" ON public.tarifas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehiculos" ON public.vehiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ingresos" ON public.ingresos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on salidas" ON public.salidas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pagos" ON public.pagos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mensualidades" ON public.mensualidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mensualidad_pagos" ON public.mensualidad_pagos FOR ALL USING (true) WITH CHECK (true);
