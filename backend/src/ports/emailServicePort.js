export class EmailServicePort {
  async enviarConfirmacionPedido(datos) {
    throw new Error(
      'enviarConfirmacionPedido debe ser implementado por un adaptador'
    );
  }

  async notificarAdministrador(datos) {
    throw new Error(
      'notificarAdministrador debe ser implementado por un adaptador'
    );
  }
}
