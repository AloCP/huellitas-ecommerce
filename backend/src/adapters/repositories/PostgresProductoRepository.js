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
