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
    const itemsHtml = (order.items || []).map(item => 
      `<li>${item.nombre || item.title || 'Producto'} x ${item.cantidad || item.quantity || 1} - $${item.precio || item.price || 0}</li>`
    ).join('');

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4CAF50;">¡Gracias por tu compra en Huellitas! 🐾</h2>
        <p>Hemos recibido tu pedido con el estado <strong>PENDIENTE DE PAGO</strong>.</p>
        
        <h3>Resumen de tu Orden:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total a Pagar:</strong> $${order.total}</p>

        <hr style="border: 0; border-top: 1px solid #ccc;" />

        <h3 style="color: #2196F3;">Instrucciones para completar tu pago:</h3>
        <p>Realiza una transferencia bancaria utilizando los siguientes datos:</p>
        <ul>
          <li><strong>Banco:</strong> BBVA Bancomer</li>
          <li><strong>CLABE:</strong> 012180001234567890</li>
          <li><strong>Beneficiario:</strong> Huellitas E-Commerce S.A.</li>
          <li><strong>Concepto / Referencia:</strong> Pedido #${order.id || Date.now()}</li>
        </ul>
        <p>Una vez realizado el pago, por favor responde a este correo adjuntando tu comprobante.</p>
      </div>
    `;
  }

  async sendOrderConfirmation(order) {
    const mailOptions = {
      from: '"Huellitas E-Commerce" <no-reply@huellitas.com>',
      to: order.email || order.customerEmail,
      subject: `Confirmación de Pedido #${order.id || ''} - Instrucciones de Pago`,
      html: this.generateHTMLTemplate(order)
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return info;
  }

  async sendAdminNotification(order) {
    const mailOptions = {
      from: '"Sistema Huellitas" <system@huellitas.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `[NUEVA ORDEN] Se ha generado un nuevo pedido`,
      html: `<p>Se ha generado una nueva orden con el total de <strong>$${order.total}</strong> para el cliente <strong>${order.email || order.customerEmail}</strong>.</p>`
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = NodemailerAdapter;
