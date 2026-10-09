import nodemailer from 'nodemailer';

import { EmailServicePort } from '../ports/emailServicePort.js';

import {
  plantillaCliente,
  plantillaAdministrador
} from '../infrastructure/email/pedidoEmailTemplate.js';

export class NodemailerAdapter extends EmailServicePort {
  constructor({
    adminEmail = 'admin@huellitas.com',
    instruccionesPago
  } = {}) {
    super();

    this.adminEmail = adminEmail;

    this.instruccionesPago =
      instruccionesPago ||
      `Banco: Banco de Prueba
Cuenta: 1234567890
CLABE: 012345678901234567
Concepto: Escribe tu número de pedido`;

    this.transporter = null;
    this.remitente = null;
  }

  async inicializar() {
    if (this.transporter) {
      return;
    }

    const cuenta =
      await nodemailer.createTestAccount();

    this.remitente =
      `"Huellitas E-Commerce" <${cuenta.user}>`;

    this.transporter =
      nodemailer.createTransport({
        host: cuenta.smtp.host,
        port: cuenta.smtp.port,
        secure: cuenta.smtp.secure,

        auth: {
          user: cuenta.user,
          pass: cuenta.pass
        }
      });

    console.log(
      '✅ Servicio de correo Ethereal preparado'
    );
  }

  async enviarConfirmacionPedido({
    pedido,
    usuario
  }) {
    await this.inicializar();

    const info =
      await this.transporter.sendMail({
        from: this.remitente,
        to: usuario.email,

        subject:
          `Pedido #${pedido.id} - Pendiente de Pago`,

        html: plantillaCliente({
          pedido,
          usuario,
          instruccionesPago:
            this.instruccionesPago
        })
      });

    const previewUrl =
      nodemailer.getTestMessageUrl(info);

    console.log('');
    console.log(
      '========================================'
    );
    console.log(
      `📧 CORREO CLIENTE - PEDIDO #${pedido.id}`
    );
    console.log(previewUrl);
    console.log(
      '========================================'
    );
    console.log('');

    return {
      messageId: info.messageId,
      previewUrl
    };
  }

  async notificarAdministrador({
    pedido,
    usuario
  }) {
    await this.inicializar();

    const info =
      await this.transporter.sendMail({
        from: this.remitente,
        to: this.adminEmail,

        subject:
          `Nuevo pedido #${pedido.id} - Huellitas`,

        html: plantillaAdministrador({
          pedido,
          usuario
        })
      });

    const previewUrl =
      nodemailer.getTestMessageUrl(info);

    console.log('');
    console.log(
      '========================================'
    );
    console.log(
      `📧 CORREO ADMIN - PEDIDO #${pedido.id}`
    );
    console.log(previewUrl);
    console.log(
      '========================================'
    );
    console.log('');

    return {
      messageId: info.messageId,
      previewUrl
    };
  }
}
