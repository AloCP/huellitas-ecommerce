#!/usr/bin/env bash
set -euo pipefail

ROOT="/mnt/c/taller3"

if [ ! -d "$ROOT/backend" ] || [ ! -d "$ROOT/frontend" ]; then
  echo "ERROR: No encuentro $ROOT/backend y $ROOT/frontend"
  exit 1
fi

cd "$ROOT"

BACKUP="backend/_act24_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
cp -f backend/index.js "$BACKUP/index.js" 2>/dev/null || true
cp -f backend/src/application/PedidoUseCase.js "$BACKUP/PedidoUseCase.js" 2>/dev/null || true
cp -f backend/src/infrastructure/database/postgres.js "$BACKUP/postgres.js" 2>/dev/null || true
cp -f backend/src/infrastructure/security/bcryptAdapter.js "$BACKUP/bcryptAdapter.js" 2>/dev/null || true

echo "Respaldo local creado en: $BACKUP"

mkdir -p backend/src/domain/entities
mkdir -p backend/src/application/useCases
mkdir -p backend/src/ports
mkdir -p backend/src/adapters/repositories
mkdir -p backend/src/infrastructure/database
mkdir -p backend/src/infrastructure/security
mkdir -p backend/src/infrastructure/http
mkdir -p frontend/src/services

cat > backend/src/domain/entities/Usuario.js <<'EOF'
export class Usuario {
  constructor({ id = null, nombre, email, rol = 'USER' }) {
    if (!nombre || !nombre.trim()) throw new Error('El nombre es obligatorio');
    if (!email || !email.includes('@')) throw new Error('El correo no es válido');
    if (!['USER', 'ADMIN'].includes(rol)) throw new Error('Rol no válido');

    this.id = id;
    this.nombre = nombre.trim();
    this.email = email.trim().toLowerCase();
    this.rol = rol;
  }

  static validarPassword(password) {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  }
}
EOF

cat > backend/src/domain/entities/Producto.js <<'EOF'
export class Producto {
  constructor({ id = null, nombre, descripcion = '', precio, stock, imagen_url = null }) {
    if (!nombre || !nombre.trim()) throw new Error('El nombre del producto es obligatorio');
    if (Number(precio) <= 0) throw new Error('El precio debe ser mayor que cero');
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a cero');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion || '';
    this.precio = Number(precio);
    this.stock = Number(stock);
    this.imagen_url = imagen_url || null;
  }
}
EOF

cat > backend/src/domain/entities/Pedido.js <<'EOF'
export class Pedido {
  constructor({ id = null, usuario_id, items, total = 0, estado = 'PENDIENTE' }) {
    if (!usuario_id) throw new Error('El usuario es obligatorio');
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('El pedido debe contener al menos un producto');
    }

    this.id = id;
    this.usuario_id = Number(usuario_id);
    this.items = items;
    this.total = Number(total);
    this.estado = estado;
  }

  static calcularTotal(items) {
    return items.reduce(
      (total, item) => total + Number(item.precio_unitario) * Number(item.cantidad),
      0
    );
  }
}
EOF

cat > backend/src/ports/usuarioRepositoryPort.js <<'EOF'
export class UsuarioRepositoryPort {
  async create() { throw new Error('Método create no implementado'); }
  async findAll() { throw new Error('Método findAll no implementado'); }
  async findById() { throw new Error('Método findById no implementado'); }
  async findByEmail() { throw new Error('Método findByEmail no implementado'); }
  async update() { throw new Error('Método update no implementado'); }
  async delete() { throw new Error('Método delete no implementado'); }
}
EOF

cat > backend/src/ports/productoRepositoryPort.js <<'EOF'
export class ProductoRepositoryPort {
  async create() { throw new Error('Método create no implementado'); }
  async findAll() { throw new Error('Método findAll no implementado'); }
  async findById() { throw new Error('Método findById no implementado'); }
  async update() { throw new Error('Método update no implementado'); }
  async delete() { throw new Error('Método delete no implementado'); }
}
EOF

cat > backend/src/ports/pedidoRepositoryPort.js <<'EOF'
export class PedidoRepositoryPort {
  async create() { throw new Error('Método create no implementado'); }
  async findAll() { throw new Error('Método findAll no implementado'); }
  async findById() { throw new Error('Método findById no implementado'); }
  async updateEstado() { throw new Error('Método updateEstado no implementado'); }
  async delete() { throw new Error('Método delete no implementado'); }
}
EOF

cat > backend/src/ports/passwordHasherPort.js <<'EOF'
export class PasswordHasherPort {
  async hash() { throw new Error('Método hash no implementado'); }
  async compare() { throw new Error('Método compare no implementado'); }
}
EOF

cat > backend/src/infrastructure/database/postgres.js <<'EOF'
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'huellitas_act24',
  password: process.env.DB_PASSWORD || '1234',
  port: Number(process.env.DB_PORT || 5432),
});

export default pool;
EOF

cat > backend/src/infrastructure/security/bcryptAdapter.js <<'EOF'
import bcrypt from 'bcrypt';

export class BcryptAdapter {
  async hash(password) {
    return bcrypt.hash(password, 10);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default BcryptAdapter;
EOF

cat > backend/src/adapters/repositories/PostgresUsuarioRepository.js <<'EOF'
import pool from '../../infrastructure/database/postgres.js';

export class PostgresUsuarioRepository {
  async create({ nombre, email, password_hash, rol }) {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, creado_en`,
      [nombre, email, password_hash, rol]
    );
    return rows[0];
  }

  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  async update(id, data) {
    const allowed = ['nombre', 'email', 'rol', 'password_hash'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        values.push(data[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET ${fields.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, nombre, email, rol, creado_en`,
      values
    );
    return rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}
EOF

cat > backend/src/adapters/repositories/PostgresProductoRepository.js <<'EOF'
import pool from '../../infrastructure/database/postgres.js';

export class PostgresProductoRepository {
  async create({ nombre, descripcion, precio, stock, imagen_url }) {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, descripcion, precio, stock, imagen_url]
    );
    return rows[0];
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async update(id, data) {
    const allowed = ['nombre', 'descripcion', 'precio', 'stock', 'imagen_url'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        values.push(data[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE productos
       SET ${fields.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}
EOF

cat > backend/src/adapters/repositories/PostgresPedidoRepository.js <<'EOF'
import pool from '../../infrastructure/database/postgres.js';

export class PostgresPedidoRepository {
  async create({ usuario_id, total, estado, items }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const item of items) {
        const stockResult = await client.query(
          'SELECT id, nombre, stock FROM productos WHERE id = $1 FOR UPDATE',
          [item.producto_id]
        );

        if (stockResult.rowCount === 0) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }

        const producto = stockResult.rows[0];
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }
      }

      const pedidoResult = await client.query(
        `INSERT INTO pedidos (usuario_id, total, estado)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [usuario_id, total, estado]
      );

      const pedido = pedidoResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO pedido_detalles
           (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            pedido.id,
            item.producto_id,
            item.cantidad,
            item.precio_unitario,
            item.subtotal
          ]
        );

        await client.query(
          'UPDATE productos SET stock = stock - $1 WHERE id = $2',
          [item.cantidad, item.producto_id]
        );
      }

      await client.query('COMMIT');
      return this.findById(pedido.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll() {
    const { rows } = await pool.query(`
      SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre,
             p.total, p.estado, p.creado_en
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.id DESC
    `);
    return rows;
  }

  async findById(id) {
    const pedidoResult = await pool.query(
      `SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre,
              u.email AS usuario_email, p.total, p.estado, p.creado_en
       FROM pedidos p
       JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = $1`,
      [id]
    );

    if (pedidoResult.rowCount === 0) return null;

    const detallesResult = await pool.query(
      `SELECT d.id, d.producto_id, pr.nombre,
              d.cantidad, d.precio_unitario, d.subtotal
       FROM pedido_detalles d
       JOIN productos pr ON pr.id = d.producto_id
       WHERE d.pedido_id = $1
       ORDER BY d.id`,
      [id]
    );

    return {
      ...pedidoResult.rows[0],
      items: detallesResult.rows
    };
  }

  async updateEstado(id, estado) {
    const { rows } = await pool.query(
      `UPDATE pedidos
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const detalles = await client.query(
        'SELECT producto_id, cantidad FROM pedido_detalles WHERE pedido_id = $1',
        [id]
      );

      const pedido = await client.query(
        'SELECT id FROM pedidos WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (pedido.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      for (const item of detalles.rows) {
        await client.query(
          'UPDATE productos SET stock = stock + $1 WHERE id = $2',
          [item.cantidad, item.producto_id]
        );
      }

      await client.query('DELETE FROM pedidos WHERE id = $1', [id]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
EOF

cat > backend/src/application/useCases/UsuarioUseCase.js <<'EOF'
import { Usuario } from '../../domain/entities/Usuario.js';

export class UsuarioUseCase {
  constructor(usuarioRepository, passwordHasher) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async crear({ nombre, email, password, rol = 'USER' }) {
    const usuario = new Usuario({ nombre, email, rol });
    Usuario.validarPassword(password);

    const existente = await this.usuarioRepository.findByEmail(usuario.email);
    if (existente) throw new Error('El correo ya está registrado');

    const password_hash = await this.passwordHasher.hash(password);

    return this.usuarioRepository.create({
      nombre: usuario.nombre,
      email: usuario.email,
      password_hash,
      rol: usuario.rol
    });
  }

  async listar() {
    return this.usuarioRepository.findAll();
  }

  async obtener(id) {
    return this.usuarioRepository.findById(id);
  }

  async actualizar(id, data) {
    const cambios = { ...data };

    if (cambios.password !== undefined) {
      Usuario.validarPassword(cambios.password);
      cambios.password_hash = await this.passwordHasher.hash(cambios.password);
      delete cambios.password;
    }

    if (cambios.email) cambios.email = cambios.email.trim().toLowerCase();

    return this.usuarioRepository.update(id, cambios);
  }

  async eliminar(id) {
    return this.usuarioRepository.delete(id);
  }

  async login({ email, password }) {
    const usuario = await this.usuarioRepository.findByEmail(
      String(email || '').trim().toLowerCase()
    );

    if (!usuario) throw new Error('Credenciales incorrectas');

    const coincide = await this.passwordHasher.compare(password || '', usuario.password_hash);
    if (!coincide) throw new Error('Credenciales incorrectas');

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
  }
}
EOF

cat > backend/src/application/useCases/ProductoUseCase.js <<'EOF'
import { Producto } from '../../domain/entities/Producto.js';

export class ProductoUseCase {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async crear(data) {
    const producto = new Producto(data);
    return this.productoRepository.create(producto);
  }

  async listar() {
    return this.productoRepository.findAll();
  }

  async obtener(id) {
    return this.productoRepository.findById(id);
  }

  async actualizar(id, data) {
    if (data.precio !== undefined && Number(data.precio) <= 0) {
      throw new Error('El precio debe ser mayor que cero');
    }
    if (
      data.stock !== undefined &&
      (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0)
    ) {
      throw new Error('El stock debe ser un entero mayor o igual a cero');
    }

    return this.productoRepository.update(id, data);
  }

  async eliminar(id) {
    return this.productoRepository.delete(id);
  }
}
EOF

cat > backend/src/application/PedidoUseCase.js <<'EOF'
import { Pedido } from '../domain/entities/Pedido.js';

export class PedidoUseCase {
  constructor(pedidoRepository, productoRepository, usuarioRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async crearPedido({ usuario_id, items }) {
    const pedido = new Pedido({ usuario_id, items });

    const usuario = await this.usuarioRepository.findById(pedido.usuario_id);
    if (!usuario) throw new Error('Usuario no encontrado');

    const detalles = [];

    for (const item of items) {
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error('La cantidad debe ser un entero mayor que cero');
      }

      const producto = await this.productoRepository.findById(item.producto_id);
      if (!producto) throw new Error(`Producto ${item.producto_id} no encontrado`);

      if (Number(producto.stock) < cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      const precio = Number(producto.precio);
      detalles.push({
        producto_id: Number(producto.id),
        cantidad,
        precio_unitario: precio,
        subtotal: precio * cantidad
      });
    }

    const total = Pedido.calcularTotal(detalles);

    return this.pedidoRepository.create({
      usuario_id: pedido.usuario_id,
      total,
      estado: 'PENDIENTE',
      items: detalles
    });
  }

  async listarPedidos() {
    return this.pedidoRepository.findAll();
  }

  async obtenerPedido(id) {
    return this.pedidoRepository.findById(id);
  }

  async actualizarPedido(id, { estado }) {
    const permitidos = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
    if (!permitidos.includes(estado)) {
      throw new Error('Estado de pedido no válido');
    }
    return this.pedidoRepository.updateEstado(id, estado);
  }

  async eliminarPedido(id) {
    return this.pedidoRepository.delete(id);
  }
}
EOF

cat > backend/src/infrastructure/http/controllers.js <<'EOF'
function manejarError(res, error) {
  console.error(error);
  const message = error.message || 'Error interno del servidor';

  if (message.includes('no encontrado') || message.includes('no encontrada')) {
    return res.status(404).json({ error: message });
  }

  if (
    message.includes('registrado') ||
    message.includes('obligatorio') ||
    message.includes('válido') ||
    message.includes('contraseña') ||
    message.includes('Stock') ||
    message.includes('cantidad') ||
    message.includes('precio')
  ) {
    return res.status(400).json({ error: message });
  }

  if (message.includes('Credenciales')) {
    return res.status(401).json({ error: message });
  }

  if (error.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (error.code === '23503') {
    return res.status(409).json({
      error: 'No se puede eliminar porque el registro está relacionado con otros datos'
    });
  }

  return res.status(500).json({ error: message });
}

export function crearControladores({ usuarioUseCase, productoUseCase, pedidoUseCase }) {
  const usuarios = {
    crear: async (req, res) => {
      try {
        res.status(201).json(await usuarioUseCase.crear(req.body));
      } catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await usuarioUseCase.listar()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await usuarioUseCase.obtener(req.params.id);
        if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await usuarioUseCase.actualizar(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await usuarioUseCase.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado correctamente' });
      } catch (e) { manejarError(res, e); }
    },
    login: async (req, res) => {
      try { res.json(await usuarioUseCase.login(req.body)); }
      catch (e) { manejarError(res, e); }
    }
  };

  const productos = {
    crear: async (req, res) => {
      try { res.status(201).json(await productoUseCase.crear(req.body)); }
      catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await productoUseCase.listar()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await productoUseCase.obtener(req.params.id);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await productoUseCase.actualizar(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await productoUseCase.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
      } catch (e) { manejarError(res, e); }
    }
  };

  const pedidos = {
    crear: async (req, res) => {
      try { res.status(201).json(await pedidoUseCase.crearPedido(req.body)); }
      catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await pedidoUseCase.listarPedidos()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await pedidoUseCase.obtenerPedido(req.params.id);
        if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await pedidoUseCase.actualizarPedido(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await pedidoUseCase.eliminarPedido(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json({ message: 'Pedido eliminado y stock restaurado' });
      } catch (e) { manejarError(res, e); }
    }
  };

  return { usuarios, productos, pedidos };
}
EOF

cat > backend/src/infrastructure/http/routes.js <<'EOF'
import { Router } from 'express';

export function crearRouter(controladores) {
  const router = Router();
  const { usuarios, productos, pedidos } = controladores;

  router.post('/login', usuarios.login);

  router.post('/usuarios', usuarios.crear);
  router.get('/usuarios', usuarios.listar);
  router.get('/usuarios/:id', usuarios.obtener);
  router.put('/usuarios/:id', usuarios.actualizar);
  router.delete('/usuarios/:id', usuarios.eliminar);

  router.post('/productos', productos.crear);
  router.get('/productos', productos.listar);
  router.get('/productos/:id', productos.obtener);
  router.put('/productos/:id', productos.actualizar);
  router.delete('/productos/:id', productos.eliminar);

  router.post('/pedidos', pedidos.crear);
  router.get('/pedidos', pedidos.listar);
  router.get('/pedidos/:id', pedidos.obtener);
  router.put('/pedidos/:id', pedidos.actualizar);
  router.delete('/pedidos/:id', pedidos.eliminar);

  return router;
}
EOF

cat > backend/index.js <<'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { default: pool } = await import('./src/infrastructure/database/postgres.js');
const { BcryptAdapter } = await import('./src/infrastructure/security/bcryptAdapter.js');
const { PostgresUsuarioRepository } = await import('./src/adapters/repositories/PostgresUsuarioRepository.js');
const { PostgresProductoRepository } = await import('./src/adapters/repositories/PostgresProductoRepository.js');
const { PostgresPedidoRepository } = await import('./src/adapters/repositories/PostgresPedidoRepository.js');
const { UsuarioUseCase } = await import('./src/application/useCases/UsuarioUseCase.js');
const { ProductoUseCase } = await import('./src/application/useCases/ProductoUseCase.js');
const { PedidoUseCase } = await import('./src/application/PedidoUseCase.js');
const { crearControladores } = await import('./src/infrastructure/http/controllers.js');
const { crearRouter } = await import('./src/infrastructure/http/routes.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const usuarioRepository = new PostgresUsuarioRepository();
const productoRepository = new PostgresProductoRepository();
const pedidoRepository = new PostgresPedidoRepository();
const passwordHasher = new BcryptAdapter();

const usuarioUseCase = new UsuarioUseCase(usuarioRepository, passwordHasher);
const productoUseCase = new ProductoUseCase(productoRepository);
const pedidoUseCase = new PedidoUseCase(
  pedidoRepository,
  productoRepository,
  usuarioRepository
);

const controladores = crearControladores({
  usuarioUseCase,
  productoUseCase,
  pedidoUseCase
});

app.get('/api', (_req, res) => {
  res.json({ message: 'API Huellitas - Arquitectura Hexagonal' });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'conectada' });
  } catch (error) {
    res.status(500).json({ ok: false, database: 'sin conexión', error: error.message });
  }
});

app.use('/api', crearRouter(controladores));

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Huellitas listo en http://localhost:${PORT}`);
});
EOF

cat > backend/database.sql <<'EOF'
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
  imagen_url TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON pedido_detalles(pedido_id);
EOF

cat > backend/.env.example <<'EOF'
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=huellitas_act24
DB_USER=postgres
DB_PASSWORD=1234
EOF

cat > frontend/src/services/api.js <<'EOF'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Error HTTP ${response.status}`);
  }

  return data;
}

export const usuariosApi = {
  login: (body) => apiFetch('/login', { method: 'POST', body: JSON.stringify(body) }),
  listar: () => apiFetch('/usuarios'),
  obtener: (id) => apiFetch(`/usuarios/${id}`),
  crear: (body) => apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
};

export const productosApi = {
  listar: () => apiFetch('/productos'),
  obtener: (id) => apiFetch(`/productos/${id}`),
  crear: (body) => apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/productos/${id}`, { method: 'DELETE' })
};

export const pedidosApi = {
  listar: () => apiFetch('/pedidos'),
  obtener: (id) => apiFetch(`/pedidos/${id}`),
  crear: (body) => apiFetch('/pedidos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/pedidos/${id}`, { method: 'DELETE' })
};
EOF

cat > frontend/.env.example <<'EOF'
VITE_API_URL=http://localhost:3001
EOF

touch .gitignore
grep -qxF 'backend/.env' .gitignore || echo 'backend/.env' >> .gitignore
grep -qxF 'frontend/.env' .gitignore || echo 'frontend/.env' >> .gitignore

npm pkg set type=module
npm pkg set scripts.backend="node backend/index.js"

npm install express cors dotenv pg bcrypt

echo
echo "=============================================="
echo "ACT. 2.4: BACKEND HEXAGONAL PREPARADO"
echo "=============================================="
echo "Siguiente:"
echo "1) cp backend/.env.example backend/.env"
echo "2) Crear la BD huellitas_act24"
echo "3) Ejecutar backend/database.sql"
echo "4) npm run backend"
echo
