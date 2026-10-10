export class AnalyticsService {
  constructor(analyticsRepository) {
    this.analyticsRepository =
      analyticsRepository;
  }

  normalizarFiltros({
    desde,
    hasta,
    periodo = 'dia',
    limite = 5
  } = {}) {
    const periodosPermitidos = [
      'dia',
      'semana',
      'mes'
    ];

    const periodoFinal =
      periodosPermitidos.includes(periodo)
        ? periodo
        : 'dia';

    let limiteFinal =
      Number(limite);

    if (
      !Number.isInteger(limiteFinal) ||
      limiteFinal < 1
    ) {
      limiteFinal = 5;
    }

    if (limiteFinal > 10) {
      limiteFinal = 10;
    }

    return {
      desde:
        desde || null,

      hasta:
        hasta || null,

      periodo:
        periodoFinal,

      limite:
        limiteFinal
    };
  }

  async obtenerDashboard(filtros = {}) {
    const filtrosFinales =
      this.normalizarFiltros(
        filtros
      );

    const [
      resumen,
      productos,
      ingresos,
      estados,
      ticketPromedio
    ] = await Promise.all([
      this.analyticsRepository
        .obtenerResumen(
          filtrosFinales
        ),

      this.analyticsRepository
        .obtenerProductosMasVendidos(
          filtrosFinales
        ),

      this.analyticsRepository
        .obtenerIngresos(
          filtrosFinales
        ),

      this.analyticsRepository
        .obtenerEstadosPedidos(
          filtrosFinales
        ),

      this.analyticsRepository
        .obtenerTicketPromedio(
          filtrosFinales
        )
    ]);

    return {
      filtros:
        filtrosFinales,

      resumen,

      productosMasVendidos:
        productos,

      ingresos,

      estadosPedidos:
        estados,

      ticketPromedio
    };
  }

  async obtenerProductos(
    filtros = {}
  ) {
    return this.analyticsRepository
      .obtenerProductosMasVendidos(
        this.normalizarFiltros(
          filtros
        )
      );
  }

  async obtenerIngresos(
    filtros = {}
  ) {
    return this.analyticsRepository
      .obtenerIngresos(
        this.normalizarFiltros(
          filtros
        )
      );
  }

  async obtenerEstados(
    filtros = {}
  ) {
    return this.analyticsRepository
      .obtenerEstadosPedidos(
        this.normalizarFiltros(
          filtros
        )
      );
  }

  async obtenerTicketPromedio(
    filtros = {}
  ) {
    return this.analyticsRepository
      .obtenerTicketPromedio(
        this.normalizarFiltros(
          filtros
        )
      );
  }
}
