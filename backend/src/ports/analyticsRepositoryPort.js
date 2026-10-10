export class AnalyticsRepositoryPort {
  async obtenerProductosMasVendidos(filtros) {
    throw new Error(
      'obtenerProductosMasVendidos debe ser implementado'
    );
  }

  async obtenerIngresos(filtros) {
    throw new Error(
      'obtenerIngresos debe ser implementado'
    );
  }

  async obtenerEstadosPedidos(filtros) {
    throw new Error(
      'obtenerEstadosPedidos debe ser implementado'
    );
  }

  async obtenerTicketPromedio(filtros) {
    throw new Error(
      'obtenerTicketPromedio debe ser implementado'
    );
  }

  async obtenerResumen(filtros) {
    throw new Error(
      'obtenerResumen debe ser implementado'
    );
  }
}
