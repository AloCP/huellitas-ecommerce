class EmailServicePort {
  async sendOrderConfirmation(order) {
    throw new Error("Método sendOrderConfirmation no implementado");
  }
  async sendAdminNotification(order) {
    throw new Error("Método sendAdminNotification no implementado");
  }
}

module.exports = EmailServicePort;
