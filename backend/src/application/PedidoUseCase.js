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
