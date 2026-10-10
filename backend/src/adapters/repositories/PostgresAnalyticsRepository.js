import pool from '../../infrastructure/database/postgres.js';

import {
  AnalyticsRepositoryPort
} from '../../ports/analyticsRepositoryPort.js';

export class PostgresAnalyticsRepository
  extends AnalyticsRepositoryPort {

  construirFiltroFecha(
    filtros,
    alias = 'p'
  ) {
    const condiciones = [];
    const valores = [];

    if (filtros.desde) {
      valores.push(
        filtros.desde
      );

      condiciones.push(
        `${alias}.creado_en >= $${valores.length}::date`
      );
    }

    if (filtros.hasta) {
      valores.push(
        filtros.hasta
      );

      condiciones.push(
        `${alias}.creado_en < ($${valores.length}::date + INTERVAL '1 day')`
      );
    }

    return {
      condiciones,
      valores
    };
  }

  async obtenerProductosMasVendidos(
    filtros
  ) {
    const {
      condiciones,
      valores
    } = this.construirFiltroFecha(
      filtros,
      'pe'
    );

    condiciones.push(
      `pe.estado <> 'CANCELADO'`
    );

    valores.push(
      filtros.limite
    );

    const where =
      `WHERE ${condiciones.join(
        ' AND '
      )}`;

    const limiteParametro =
      `$${valores.length}`;

    const resultado =
      await pool.query(
        `
        SELECT
          pr.id,
          pr.nombre,

          SUM(pd.cantidad)::INTEGER
            AS unidades_vendidas,

          ROUND(
            SUM(pd.subtotal)::NUMERIC,
            2
          ) AS monto_recaudado,

          COUNT(
            DISTINCT pe.id
          )::INTEGER
            AS pedidos

        FROM pedido_detalles pd

        INNER JOIN pedidos pe
          ON pe.id = pd.pedido_id

        INNER JOIN productos pr
          ON pr.id = pd.producto_id

        ${where}

        GROUP BY
          pr.id,
          pr.nombre

        ORDER BY
          unidades_vendidas DESC,
          monto_recaudado DESC

        LIMIT ${limiteParametro}
        `,
        valores
      );

    return resultado.rows.map(
      (fila) => ({
        id:
          Number(fila.id),

        nombre:
          fila.nombre,

        unidades_vendidas:
          Number(
            fila.unidades_vendidas
          ),

        monto_recaudado:
          Number(
            fila.monto_recaudado
          ),

        pedidos:
          Number(
            fila.pedidos
          )
      })
    );
  }

  async obtenerIngresos(
    filtros
  ) {
    const {
      condiciones,
      valores
    } = this.construirFiltroFecha(
      filtros,
      'p'
    );

    condiciones.push(
      `p.estado <> 'CANCELADO'`
    );

    const where =
      `WHERE ${condiciones.join(
        ' AND '
      )}`;

    let agrupacion;

    switch (
      filtros.periodo
    ) {
      case 'mes':
        agrupacion =
          `DATE_TRUNC(
            'month',
            p.creado_en
          )`;
        break;

      case 'semana':
        agrupacion =
          `DATE_TRUNC(
            'week',
            p.creado_en
          )`;
        break;

      default:
        agrupacion =
          `DATE_TRUNC(
            'day',
            p.creado_en
          )`;
    }

    const totalResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(p.total),
            0
          )::NUMERIC(12,2)
            AS total_ingresos,

          COUNT(*)::INTEGER
            AS total_pedidos

        FROM pedidos p

        ${where}
        `,
        valores
      );

    const tendenciaResult =
      await pool.query(
        `
        SELECT
          ${agrupacion}
            AS periodo,

          COALESCE(
            SUM(p.total),
            0
          )::NUMERIC(12,2)
            AS ingresos,

          COUNT(*)::INTEGER
            AS pedidos

        FROM pedidos p

        ${where}

        GROUP BY
          ${agrupacion}

        ORDER BY
          periodo ASC
        `,
        valores
      );

    return {
      total:
        Number(
          totalResult.rows[0]
            .total_ingresos
        ),

      pedidos:
        Number(
          totalResult.rows[0]
            .total_pedidos
        ),

      tendencia:
        tendenciaResult.rows.map(
          (fila) => ({
            periodo:
              fila.periodo,

            ingresos:
              Number(
                fila.ingresos
              ),

            pedidos:
              Number(
                fila.pedidos
              )
          })
        )
    };
  }

  async obtenerEstadosPedidos(
    filtros
  ) {
    const {
      condiciones,
      valores
    } = this.construirFiltroFecha(
      filtros,
      'p'
    );

    const where =
      condiciones.length
        ? `WHERE ${condiciones.join(
            ' AND '
          )}`
        : '';

    const resultado =
      await pool.query(
        `
        WITH estados AS (
          SELECT
            p.estado,

            COUNT(*)::INTEGER
              AS cantidad

          FROM pedidos p

          ${where}

          GROUP BY
            p.estado
        ),

        total AS (
          SELECT
            COALESCE(
              SUM(cantidad),
              0
            ) AS cantidad_total

          FROM estados
        )

        SELECT
          e.estado,
          e.cantidad,

          CASE
            WHEN t.cantidad_total = 0
              THEN 0

            ELSE ROUND(
              (
                e.cantidad::NUMERIC /
                t.cantidad_total::NUMERIC
              ) * 100,
              2
            )
          END AS porcentaje

        FROM estados e

        CROSS JOIN total t

        ORDER BY
          e.cantidad DESC
        `,
        valores
      );

    return resultado.rows.map(
      (fila) => ({
        estado:
          fila.estado,

        cantidad:
          Number(
            fila.cantidad
          ),

        porcentaje:
          Number(
            fila.porcentaje
          )
      })
    );
  }

  async obtenerTicketPromedio(
    filtros
  ) {
    const {
      condiciones,
      valores
    } = this.construirFiltroFecha(
      filtros,
      'p'
    );

    condiciones.push(
      `p.estado <> 'CANCELADO'`
    );

    const where =
      `WHERE ${condiciones.join(
        ' AND '
      )}`;

    const pedidoResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            AVG(p.total),
            0
          )::NUMERIC(12,2)
            AS promedio_pedido

        FROM pedidos p

        ${where}
        `,
        valores
      );

    const usuarioResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            AVG(total_usuario),
            0
          )::NUMERIC(12,2)
            AS promedio_usuario

        FROM (
          SELECT
            p.usuario_id,

            SUM(p.total)
              AS total_usuario

          FROM pedidos p

          ${where}

          GROUP BY
            p.usuario_id
        ) ventas_usuario
        `,
        valores
      );

    return {
      porPedido:
        Number(
          pedidoResult.rows[0]
            .promedio_pedido
        ),

      porUsuario:
        Number(
          usuarioResult.rows[0]
            .promedio_usuario
        )
    };
  }

  async obtenerResumen(
    filtros
  ) {
    const {
      condiciones,
      valores
    } = this.construirFiltroFecha(
      filtros,
      'p'
    );

    condiciones.push(
      `p.estado <> 'CANCELADO'`
    );

    const where =
      `WHERE ${condiciones.join(
        ' AND '
      )}`;

    const resultado =
      await pool.query(
        `
        SELECT
          COUNT(*)::INTEGER
            AS pedidos,

          COALESCE(
            SUM(p.total),
            0
          )::NUMERIC(12,2)
            AS ingresos,

          COALESCE(
            AVG(p.total),
            0
          )::NUMERIC(12,2)
            AS ticket_promedio,

          COUNT(
            DISTINCT p.usuario_id
          )::INTEGER
            AS clientes

        FROM pedidos p

        ${where}
        `,
        valores
      );

    const fila =
      resultado.rows[0];

    return {
      pedidos:
        Number(
          fila.pedidos
        ),

      ingresos:
        Number(
          fila.ingresos
        ),

      ticketPromedio:
        Number(
          fila.ticket_promedio
        ),

      clientes:
        Number(
          fila.clientes
        )
    };
  }
}
