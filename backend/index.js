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
