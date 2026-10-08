export class PedidoUseCase {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async crearPedido({ items, total, userEmail }) {
    if (!items || items.length === 0) {
      throw new Error('El carrito no contiene productos.');
    }

    const pedido = {
      id: Math.floor(100000 + Math.random() * 900000),
      items,
      total,
      userEmail: userEmail || 'cliente@ejemplo.com',
      fecha: new Date().toLocaleString('es-MX')
    };

    // Construir contenido HTML para la plantilla del correo
    const listaProductos = items
      .map(item => `<li><strong>${item.nombre}</strong> (x${item.cantidad}) - $${(item.precio * item.cantidad).toFixed(2)}</li>`)
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #4f46e5; text-align: center;">🐾 ¡Gracias por tu compra en Huellitas!</h2>
        <p>Tu pedido <strong>#${pedido.id}</strong> fue procesado exitosamente.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <h3>Resumen del Pedido:</h3>
        <ul>${listaProductos}</ul>
        <h3 style="color: #16a34a;">Total Pagado: $${pedido.total.toFixed(2)}</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p style="font-size: 0.85rem; color: #666; text-align: center;">Este es un mensaje automático de confirmación generado por Huellitas E-commerce.</p>
      </div>
    `;

    // Disparar el puerto de envío de correos
    await this.emailService.sendEmail({
      to: pedido.userEmail,
      subject: `Confirmación de Compra #${pedido.id} - Huellitas`,
      html: htmlContent
    });

    return pedido;
  }
}