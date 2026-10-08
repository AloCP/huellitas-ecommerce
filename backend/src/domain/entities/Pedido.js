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
