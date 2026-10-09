const nodemailer = require('nodemailer'); 
const EmailServicePort = require('../ports/emailServicePort'); 

class NodemailerAdapter extends EmailServicePort {
  constructor() { 
    super(); 
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email', 
      port: process.env.SMTP_PORT || 587, 
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS
      } 
    }); 
  } 
  
  generateHTMLTemplate(order) { 
    // Multiplicamos precio por cantidad para el subtotal en la lista
    const itemsList = (order.items || []).map(i => 
      `<li>${i.nombre} x <strong>${i.cantidad}</strong> - $${i.precio * i.cantidad}</li>`
    ).join(''); 

    // Lógica dinámica para mostrar instrucciones según el método de pago
    let instruccionesPago = '';
    if (order.metodoPago === 'SPEI') {
        instruccionesPago = `
          <p>Transferir a CLABE: <strong>012180001234567890</strong> (BBVA)</p>
          <p>Concepto: Pago Huellitas</p>`;
    } else if (order.metodoPago === 'TARJETA') {
        instruccionesPago = `<p>Haz clic en el siguiente enlace seguro para procesar tu tarjeta mediante Stripe: <a href="#">Pagar Ahora</a></p>`;
    } else if (order.metodoPago === 'EFECTIVO') {
        instruccionesPago = `<p>Dicta este código en la caja de tu OXXO más cercano: <strong>9876 5432 1098 7654</strong></p>`;
    }

    return `<div style="font-family: Arial; padding: 15px; border: 1px solid #ccc;"> 
      <h2 style="color: #2563eb;">¡Gracias por tu compra en Huellitas!</h2>
      <p>Estado de Orden: <strong>PENDIENTE DE PAGO</strong></p> 
      <h3>Detalle del Pedido:</h3>
      <ul>${itemsList}</ul> 
      <p><strong>Total a Pagar:</strong> $${order.total}</p> 
      <hr/> 
      <h3>Instrucciones de Pago (${order.metodoPago}):</h3> 
      ${instruccionesPago}
    </div>`; 
  } 
  
  async sendOrderConfirmation(order) { 
    return await this.transporter.sendMail({ 
      from: '"Huellitas E-Commerce" <no-reply@huellitas.com>', 
      to: order.email || order.customerEmail, 
      subject: `Confirmación de Pedido - Pago mediante ${order.metodoPago}`, 
      html: this.generateHTMLTemplate(order) 
    }); 
  } 
} 
module.exports = NodemailerAdapter;