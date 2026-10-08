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
