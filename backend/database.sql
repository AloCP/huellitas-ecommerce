CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'USER'
    CHECK (rol IN ('USER', 'ADMIN')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
  CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,

  usuario_id INTEGER NOT NULL
    REFERENCES usuarios(id),

  total NUMERIC(12,2)
    NOT NULL
    CHECK (total >= 0),

  estado VARCHAR(30)
    NOT NULL
    DEFAULT 'PENDIENTE_PAGO'
    CHECK (
      estado IN (
        'PENDIENTE',
        'PENDIENTE_PAGO',
        'PAGADO',
        'ENVIADO',
        'ENTREGADO',
        'CANCELADO'
      )
    ),

  creado_en TIMESTAMP
    NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
  id SERIAL PRIMARY KEY,  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON pedido_detalles(pedido_id);
