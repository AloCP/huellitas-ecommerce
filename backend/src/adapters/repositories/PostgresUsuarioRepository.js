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
