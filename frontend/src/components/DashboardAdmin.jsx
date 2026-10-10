import React, { useEffect, useMemo, useState } from 'react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import {
  reportesApi
} from '../services/api';

import './DashboardAdmin.css';

const COLORES_ESTADOS = [
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#64748b'
];

function fechaISO(fecha) {
  const year =
    fecha.getFullYear();

  const month =
    String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      fecha.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function moneda(valor) {
  return Number(
    valor || 0
  ).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN'
    }
  );
}

function nombreEstado(estado) {
  const nombres = {
    PENDIENTE:
      'Pendiente',

    PENDIENTE_PAGO:
      'Pendiente de Pago',

    PAGADO:
      'Pagado',

    ENVIADO:
      'Enviado',

    ENTREGADO:
      'Entregado',

    CANCELADO:
      'Cancelado'
  };

  return (
    nombres[estado] ||
    estado
  );
}

function fechaGrafica(valor) {
  if (!valor) {
    return '';
  }

  const fecha =
    new Date(valor);

  return fecha.toLocaleDateString(
    'es-MX',
    {
      day: '2-digit',
      month: 'short'
    }
  );
}

export default function DashboardAdmin() {
  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  const [tipoFiltro, setTipoFiltro] =
    useState('7dias');

  const [periodo, setPeriodo] =
    useState('dia');

  const [desde, setDesde] =
    useState('');

  const [hasta, setHasta] =
    useState('');

  const [limite, setLimite] =
    useState(5);

  const obtenerFechas =
    () => {
      const hoy =
        new Date();

      if (
        tipoFiltro === 'todo'
      ) {
        return {
          desde: null,
          hasta: null
        };
      }

      if (
        tipoFiltro === '7dias'
      ) {
        const inicio =
          new Date(hoy);

        inicio.setDate(
          hoy.getDate() - 6
        );

        return {
          desde:
            fechaISO(inicio),

          hasta:
            fechaISO(hoy)
        };
      }

      if (
        tipoFiltro === 'mes'
      ) {
        const inicio =
          new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            1
          );

        return {
          desde:
            fechaISO(inicio),

          hasta:
            fechaISO(hoy)
        };
      }

      return {
        desde:
          desde || null,

        hasta:
          hasta || null
      };
    };

  const cargarDashboard =
    async () => {
      setCargando(true);
      setError('');

      try {
        const fechas =
          obtenerFechas();

        const respuesta =
          await reportesApi.dashboard({
            desde:
              fechas.desde,

            hasta:
              fechas.hasta,

            periodo,

            limite
          });

        setDatos(
          respuesta
        );
      } catch (err) {
        setError(
          err.message ||
          'No se pudieron cargar las métricas.'
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    cargarDashboard();
  }, [
    tipoFiltro,
    periodo,
    limite
  ]);

  const aplicarRango =
    () => {
      if (
        tipoFiltro !==
        'personalizado'
      ) {
        return;
      }

      if (
        !desde ||
        !hasta
      ) {
        setError(
          'Selecciona la fecha inicial y final.'
        );

        return;
      }

      if (
        desde > hasta
      ) {
        setError(
          'La fecha inicial no puede ser mayor que la fecha final.'
        );

        return;
      }

      cargarDashboard();
    };

  const ingresosGrafica =
    useMemo(() => {
      return (
        datos?.ingresos
          ?.tendencia || []
      ).map(
        (fila) => ({
          ...fila,

          etiqueta:
            fechaGrafica(
              fila.periodo
            ),

          ingresos:
            Number(
              fila.ingresos
            ),

          pedidos:
            Number(
              fila.pedidos
            )
        })
      );
    }, [datos]);

  const estadosGrafica =
    useMemo(() => {
      return (
        datos?.estadosPedidos ||
        []
      ).map(
        (fila) => ({
          name:
            nombreEstado(
              fila.estado
            ),

          value:
            Number(
              fila.cantidad
            ),

          porcentaje:
            Number(
              fila.porcentaje
            )
        })
      );
    }, [datos]);

  const productos =
    datos?.productosMasVendidos ||
    [];

  const resumen =
    datos?.resumen || {
      pedidos: 0,
      ingresos: 0,
      ticketPromedio: 0,
      clientes: 0
    };

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="loader-chart">
          📊
        </div>

        <strong>
          Procesando métricas...
        </strong>

        <p>
          Consultando información
          analítica en PostgreSQL.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">

      <section className="dashboard-header">

        <div>
          <div className="dashboard-label">
            PANEL ADMINISTRATIVO
          </div>

          <h2>
            📊 Dashboard de Métricas
          </h2>

          <p>
            Análisis comercial de
            Huellitas E-Commerce
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={
            cargarDashboard
          }
        >
          🔄 Actualizar métricas
        </button>

      </section>

      <section className="dashboard-filtros">

        <div className="filtro-grupo">

          <label>
            Rango de tiempo
          </label>

          <select
            value={
              tipoFiltro
            }
            onChange={(e) =>
              setTipoFiltro(
                e.target.value
              )
            }
          >
            <option value="7dias">
              Últimos 7 días
            </option>

            <option value="mes">
              Este mes
            </option>

            <option value="todo">
              Todo el historial
            </option>

            <option value="personalizado">
              Rango personalizado
            </option>
          </select>

        </div>

        <div className="filtro-grupo">

          <label>
            Agrupar ingresos
          </label>

          <select
            value={periodo}
            onChange={(e) =>
              setPeriodo(
                e.target.value
              )
            }
          >
            <option value="dia">
              Por día
            </option>

            <option value="semana">
              Por semana
            </option>

            <option value="mes">
              Por mes
            </option>
          </select>

        </div>

        <div className="filtro-grupo">

          <label>
            Ranking
          </label>

          <select
            value={limite}
            onChange={(e) =>
              setLimite(
                Number(
                  e.target.value
                )
              )
            }
          >
            <option value="5">
              Top 5
            </option>

            <option value="10">
              Top 10
            </option>
          </select>

        </div>

        {tipoFiltro ===
          'personalizado' && (
          <>
            <div className="filtro-grupo">
              <label>
                Desde
              </label>

              <input
                type="date"
                value={desde}
                onChange={(e) =>
                  setDesde(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="filtro-grupo">
              <label>
                Hasta
              </label>

              <input
                type="date"
                value={hasta}
                onChange={(e) =>
                  setHasta(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              className="aplicar-filtro"
              onClick={
                aplicarRango
              }
            >
              Aplicar
            </button>
          </>
        )}

      </section>

      {error && (
        <div className="dashboard-error">
          ⚠️ {error}
        </div>
      )}

      <section className="metricas-grid">

        <article className="metrica-card">

          <div className="metrica-icono ingresos">
            💰
          </div>

          <div>
            <span>
              Ingresos totales
            </span>

            <strong>
              {moneda(
                resumen.ingresos
              )}
            </strong>

            <small>
              Pedidos no cancelados
            </small>
          </div>

        </article>

        <article className="metrica-card">

          <div className="metrica-icono pedidos">
            📦
          </div>

          <div>
            <span>
              Pedidos
            </span>

            <strong>
              {resumen.pedidos}
            </strong>

            <small>
              Ventas registradas
            </small>
          </div>

        </article>

        <article className="metrica-card">

          <div className="metrica-icono ticket">
            🧾
          </div>

          <div>
            <span>
              Ticket promedio
            </span>

            <strong>
              {moneda(
                resumen.ticketPromedio
              )}
            </strong>

            <small>
              Promedio por pedido
            </small>
          </div>

        </article>

        <article className="metrica-card">

          <div className="metrica-icono clientes">
            👥
          </div>

          <div>
            <span>
              Clientes
            </span>

            <strong>
              {resumen.clientes}
            </strong>

            <small>
              Clientes con pedidos
            </small>
          </div>

        </article>

      </section>

      <section className="dashboard-charts">

        <article className="dashboard-panel dashboard-panel-grande">

          <div className="panel-heading">

            <div>
              <h3>
                📈 Tendencia de ingresos
              </h3>

              <p>
                Evolución de los ingresos
                en el período seleccionado.
              </p>
            </div>

            <div className="panel-total">
              {moneda(
                datos?.ingresos
                  ?.total
              )}
            </div>

          </div>

          {ingresosGrafica.length >
          0 ? (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={
                    ingresosGrafica
                  }
                  margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 10
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="etiqueta"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(
                      value,
                      name
                    ) => {
                      if (
                        name ===
                        'Ingresos'
                      ) {
                        return [
                          moneda(
                            value
                          ),
                          'Ingresos'
                        ];
                      }

                      return [
                        value,
                        name
                      ];
                    }}
                  />

                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="#2864e8"
                    radius={[
                      7,
                      7,
                      0,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>

            </div>

          ) : (

            <div className="sin-datos">
              📉 No existen ingresos
              para el período seleccionado.
            </div>

          )}

        </article>

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>
                🥧 Estado de pedidos
              </h3>

              <p>
                Distribución porcentual.
              </p>
            </div>

          </div>

          {estadosGrafica.length >
          0 ? (

            <>
              <div className="pie-container">

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >
                  <PieChart>

                    <Pie
                      data={
                        estadosGrafica
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({
                        porcentaje
                      }) =>
                        `${porcentaje}%`
                      }
                    >
                      {estadosGrafica.map(
                        (
                          _,
                          index
                        ) => (
                          <Cell
                            key={
                              index
                            }
                            fill={
                              COLORES_ESTADOS[
                                index %
                                  COLORES_ESTADOS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>
                </ResponsiveContainer>

              </div>

              <div className="estados-lista">

                {datos.estadosPedidos.map(
                  (
                    estado,
                    index
                  ) => (

                    <div
                      className="estado-fila"
                      key={
                        estado.estado
                      }
                    >

                      <span
                        className="estado-color"
                        style={{
                          background:
                            COLORES_ESTADOS[
                              index %
                                COLORES_ESTADOS.length
                            ]
                        }}
                      />

                      <span className="estado-nombre">
                        {nombreEstado(
                          estado.estado
                        )}
                      </span>

                      <strong>
                        {
                          estado.cantidad
                        }
                      </strong>

                      <span>
                        {
                          estado.porcentaje
                        }%
                      </span>

                    </div>
                  )
                )}

              </div>
            </>

          ) : (

            <div className="sin-datos">
              No hay pedidos para
              mostrar.
            </div>

          )}

        </article>

      </section>

      <section className="dashboard-bottom">

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>
                🏆 Productos más vendidos
              </h3>

              <p>
                Ranking por unidades
                vendidas.
              </p>
            </div>

          </div>

          {productos.length > 0 ? (

            <div className="ranking-table">

              <div className="ranking-header">
                <span>
                  Pos.
                </span>

                <span>
                  Producto
                </span>

                <span>
                  Unidades
                </span>

                <span>
                  Recaudado
                </span>
              </div>

              {productos.map(
                (
                  producto,
                  index
                ) => (

                  <div
                    className="ranking-row"
                    key={
                      producto.id
                    }
                  >

                    <span className="ranking-posicion">
                      {index === 0
                        ? '🥇'
                        : index === 1
                        ? '🥈'
                        : index === 2
                        ? '🥉'
                        : `#${index + 1}`}
                    </span>

                    <div>
                      <strong>
                        {
                          producto.nombre
                        }
                      </strong>

                      <small>
                        {
                          producto.pedidos
                        }{' '}
                        pedidos
                      </small>
                    </div>

                    <strong className="ranking-unidades">
                      {
                        producto.unidades_vendidas
                      }
                    </strong>

                    <strong className="ranking-dinero">
                      {moneda(
                        producto.monto_recaudado
                      )}
                    </strong>

                  </div>
                )
              )}

            </div>

          ) : (

            <div className="sin-datos">
              🐾 Todavía no existen
              ventas suficientes para
              generar el ranking.
            </div>

          )}

        </article>

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>
                🧾 Análisis de ticket
              </h3>

              <p>
                Promedios calculados
                directamente en PostgreSQL.
              </p>
            </div>

          </div>

          <div className="ticket-analysis">

            <div className="ticket-box">

              <span>
                Por pedido
              </span>

              <strong>
                {moneda(
                  datos
                    ?.ticketPromedio
                    ?.porPedido
                )}
              </strong>

              <p>
                Gasto medio en cada
                pedido realizado.
              </p>

            </div>

            <div className="ticket-box">

              <span>
                Por usuario
              </span>

              <strong>
                {moneda(
                  datos
                    ?.ticketPromedio
                    ?.porUsuario
                )}
              </strong>

              <p>
                Gasto promedio acumulado
                por cliente.
              </p>

            </div>

          </div>

          <div className="analytics-info">
            <strong>
              ⚙️ Procesamiento analítico
            </strong>

            <p>
              Las métricas son calculadas
              mediante consultas SQL con
              SUM, COUNT, AVG, GROUP BY
              y filtros por fecha.
            </p>

            <p>
              Node.js recibe únicamente
              los resultados agregados,
              evitando procesar grandes
              volúmenes de registros
              directamente en memoria.
            </p>
          </div>

        </article>

      </section>

    </div>
  );
}
