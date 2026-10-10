import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

dotenv.config({
  path: path.join(
    __dirname,
    '.env'
  )
});

/*
  Infraestructura
*/
const { default: pool } =
  await import(
    './src/infrastructure/database/postgres.js'
  );

const { BcryptAdapter } =
  await import(
    './src/infrastructure/security/bcryptAdapter.js'
  );

/*
  Adaptadores de salida
*/
const {
  PostgresUsuarioRepository
} = await import(
  './src/adapters/repositories/PostgresUsuarioRepository.js'
);

const {
  PostgresProductoRepository
} = await import(
  './src/adapters/repositories/PostgresProductoRepository.js'
);

const {
  PostgresPedidoRepository
} = await import(
  './src/adapters/repositories/PostgresPedidoRepository.js'
);

const {
  NodemailerAdapter
} = await import(
  './src/adapters/nodemailerAdapter.js'
);

/*
  Casos de uso
*/
const {
  UsuarioUseCase
} = await import(
  './src/application/useCases/UsuarioUseCase.js'
);

const {
  ProductoUseCase
} = await import(
  './src/application/useCases/ProductoUseCase.js'
);

const {
  PedidoUseCase
} = await import(
  './src/application/PedidoUseCase.js'
);

/*
  Adaptadores de entrada HTTP
*/
const {
  crearControladores
} = await import(
  './src/infrastructure/http/controllers.js'
);

const {
  crearRouter
} = await import(
  './src/infrastructure/http/routes.js'
);

const app =
  express();

app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads'
    )
  )
);

/*
  Repositorios PostgreSQL
*/
const usuarioRepository =
  new PostgresUsuarioRepository();

const productoRepository =
  new PostgresProductoRepository();

const pedidoRepository =
  new PostgresPedidoRepository();

/*
  Adaptador de seguridad
*/
const passwordHasher =
  new BcryptAdapter();

/*
  Adaptador de correo electrónico.

  Ethereal es utilizado por
  NodemailerAdapter para las pruebas.
*/
const emailService =
  new NodemailerAdapter({
    adminEmail:
      process.env.ADMIN_EMAIL ||
      'admin@huellitas.com',

    instruccionesPago:
      `Banco: ${
        process.env.BANK_NAME ||
        'Banco de Prueba'
      }

Cuenta: ${
        process.env.BANK_ACCOUNT ||
        '1234567890'
      }

CLABE: ${
        process.env.BANK_CLABE ||
        '012345678901234567'
      }

Concepto: Escribe tu número de pedido`
  });

/*
  Inyección de dependencias
*/
const usuarioUseCase =
  new UsuarioUseCase(
    usuarioRepository,
    passwordHasher
  );

const productoUseCase =
  new ProductoUseCase(
    productoRepository
  );

const pedidoUseCase =
  new PedidoUseCase(
    pedidoRepository,
    productoRepository,
    usuarioRepository,
    emailService
  );

/*
  Controladores
*/
const controladores =
  crearControladores({
    usuarioUseCase,
    productoUseCase,
    pedidoUseCase
  });

app.get(
  '/api',
  (_req, res) => {
    res.json({
      message:
        'API Huellitas - Arquitectura Hexagonal + Notificaciones'
    });
  }
);

app.get(
  '/api/health',
  async (_req, res) => {
    try {
      await pool.query(
        'SELECT 1'
      );

      res.json({
        ok: true,
        database:
          'conectada',

        notificaciones:
          'habilitadas'
      });
    } catch (error) {
      res.status(500).json({
        ok: false,

        database:
          'sin conexión',

        error:
          error.message
      });
    }
  }
);

/*
  Rutas REST
*/
app.use(
  '/api',
  crearRouter(controladores)
);

const PORT =
  Number(
    process.env.PORT ||
    3001
  );

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Backend Huellitas listo en http://localhost:${PORT}`
    );

    console.log(
      '📧 Servicio de notificaciones preparado'
    );
  }
);
