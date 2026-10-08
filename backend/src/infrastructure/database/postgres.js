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
