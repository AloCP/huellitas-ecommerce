class PedidoUseCase {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async crearPedido({ usuario_id, producto_id, cantidad }) {
    const resProd = await this.pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
    if (resProd.rows.length === 0) throw new Error('El producto no existe.');

    const producto = resProd.rows[0];
    if (producto.stock < cantidad) throw new Error('Stock insuficiente.');

    const monto_total = producto.precio * cantidad;

    await this.pool.query('BEGIN');
    await this.pool.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [cantidad, producto_id]);
    const resPedido = await this.pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad, monto_total) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, producto_id, cantidad, monto_total]
    );
    await this.pool.query('COMMIT');

    return resPedido.rows[0];
  }
}

module.exports = PedidoUseCase;
