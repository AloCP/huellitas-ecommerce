import { Pedido } from '../domain/entities/Pedido.js';

export class PedidoUseCase {
  constructor(
    pedidoRepository,
    productoRepository,
    usuarioRepository,
    emailService
  ) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.emailService = emailService;
  }

  async crearPedido({ usuario_id, items }) {
    const pedidoBase = new Pedido({
      usuario_id,
      items
    });

    // Buscar al usuario que está realizando la compra
    const usuario =
      await this.usuarioRepository.findById(
        pedidoBase.usuario_id
      );

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const detalles = [];

    // Validar los productos y el stock
    for (const item of items) {
      const cantidad = Number(item.cantidad);

      if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error(
          'La cantidad debe ser un entero mayor que cero'
        );
      }

      const producto =
        await this.productoRepository.findById(
          item.producto_id
        );

      if (!producto) {
        throw new Error(
          `Producto ${item.producto_id} no encontrado`
        );
      }

      if (
        Number(producto.stock) <
        cantidad
      ) {
        throw new Error(
          `Stock insuficiente para ${producto.nombre}`
        );
      }

      const precio =
        Number(producto.precio);

      detalles.push({
        producto_id:
          Number(producto.id),

        nombre:
          producto.nombre,

        cantidad,

        precio_unitario:
          precio,

        subtotal:
          precio * cantidad
      });
    }

    // El total se calcula en el backend
    const total =
      Pedido.calcularTotal(detalles);

    // Guardar pedido en PostgreSQL
    // La actividad 2.5 requiere Pendiente de Pago
    const pedidoCreado =
      await this.pedidoRepository.create({
        usuario_id:
          pedidoBase.usuario_id,

        total,

        estado:
          'PENDIENTE_PAGO',

        items:
          detalles
      });

    /*
      El pedido ya fue guardado correctamente.

      Ahora se utiliza el puerto EmailServicePort.
      PedidoUseCase NO conoce Nodemailer.
    */

    const notificaciones = {
      cliente: null,
      administrador: null
    };

    if (this.emailService) {
      const resultados =
        await Promise.allSettled([
          this.emailService
            .enviarConfirmacionPedido({
              pedido: pedidoCreado,
              usuario
            }),

          this.emailService
            .notificarAdministrador({
              pedido: pedidoCreado,
              usuario
            })
        ]);

      // Resultado del correo del cliente
      if (
        resultados[0].status ===
        'fulfilled'
      ) {
        notificaciones.cliente =
          resultados[0].value;
      } else {
        console.error(
          'Error enviando correo al cliente:',
          resultados[0].reason
        );

        notificaciones.cliente = {
          error:
            resultados[0].reason?.message ||
            'Error enviando correo'
        };
      }

      // Resultado del correo del administrador
      if (
        resultados[1].status ===
        'fulfilled'
      ) {
        notificaciones.administrador =
          resultados[1].value;
      } else {
        console.error(
          'Error enviando correo al administrador:',
          resultados[1].reason
        );

        notificaciones.administrador = {
          error:
            resultados[1].reason?.message ||
            'Error enviando correo'
        };
      }
    }

    /*
      Para las pruebas con Ethereal se regresan
      los previewUrl.

      Así podremos abrir los dos correos en
      el navegador y tomar las evidencias.
    */
    return {
      ...pedidoCreado,
      notificaciones
    };
  }

  async listarPedidos() {
    return this.pedidoRepository.findAll();
  }

  async obtenerPedido(id) {
    return this.pedidoRepository.findById(id);
  }

  async actualizarPedido(
    id,
    { estado }
  ) {
    const permitidos = [
      'PENDIENTE',
      'PENDIENTE_PAGO',
      'PAGADO',
      'ENVIADO',
      'ENTREGADO',
      'CANCELADO'
    ];

    if (!permitidos.includes(estado)) {
      throw new Error(
        'Estado de pedido no válido'
      );
    }

    return this.pedidoRepository
      .updateEstado(
        id,
        estado
      );
  }

  async eliminarPedido(id) {
    return this.pedidoRepository.delete(id);
  }
}
