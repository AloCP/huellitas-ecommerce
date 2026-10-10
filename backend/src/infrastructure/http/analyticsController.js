export function crearAnalyticsController(analyticsService) {
  return {
    dashboard: async (req, res) => {
      try {
        const resultado = await analyticsService.obtenerDashboard({
          desde: req.query.desde,
          hasta: req.query.hasta,
          periodo: req.query.periodo,
          limite: req.query.limite
        });

        res.json(resultado);
      } catch (error) {
        console.error('Error obteniendo dashboard:', error);

        res.status(500).json({
          error: error.message || 'No se pudo generar el dashboard'
        });
      }
    },

    productos: async (req, res) => {
      try {
        const resultado = await analyticsService.obtenerProductos({
          desde: req.query.desde,
          hasta: req.query.hasta,
          limite: req.query.limite
        });

        res.json(resultado);
      } catch (error) {
        console.error('Error obteniendo productos:', error);

        res.status(500).json({
          error:
            error.message ||
            'No se pudo generar el reporte de productos'
        });
      }
    },

    ingresos: async (req, res) => {
      try {
        const resultado = await analyticsService.obtenerIngresos({
          desde: req.query.desde,
          hasta: req.query.hasta,
          periodo: req.query.periodo
        });

        res.json(resultado);
      } catch (error) {
        console.error('Error obteniendo ingresos:', error);

        res.status(500).json({
          error:
            error.message ||
            'No se pudo generar el reporte de ingresos'
        });
      }
    },

    estados: async (req, res) => {
      try {
        const resultado = await analyticsService.obtenerEstados({
          desde: req.query.desde,
          hasta: req.query.hasta
        });

        res.json(resultado);
      } catch (error) {
        console.error('Error obteniendo estados:', error);

        res.status(500).json({
          error:
            error.message ||
            'No se pudo generar el reporte de estados'
        });
      }
    },

    ticketPromedio: async (req, res) => {
      try {
        const resultado =
          await analyticsService.obtenerTicketPromedio({
            desde: req.query.desde,
            hasta: req.query.hasta
          });

        res.json(resultado);
      } catch (error) {
        console.error('Error obteniendo ticket promedio:', error);

        res.status(500).json({
          error:
            error.message ||
            'No se pudo generar el ticket promedio'
        });
      }
    }
  };
}
