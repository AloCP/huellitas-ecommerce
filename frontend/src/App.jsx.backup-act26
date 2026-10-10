import React, { useEffect, useMemo, useState } from 'react';

import {
  usuariosApi,
  productosApi,
  pedidosApi
} from './services/api';

/* =========================================================
   IMÁGENES
   Las imágenes solamente se manejan en el frontend.
   No se almacenan en PostgreSQL.
   ========================================================= */

const IMAGENES_PRODUCTOS = {
  'Croquetas para perro':
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80',

  'Collar para mascota':
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',

  'Alimento Premium Perro (3kg)':
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80',

  'Juguete Interactivo Mordedera':
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80',

  'Cama Ortopédica Grande':
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80',

  'Correa Retráctil 5m':
    'https://images.unsplash.com/photo-1603525281898-0be7dc8a474c?w=600&q=80',

  'Shampoo Avena Antipulgas':
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80',

      'Plato Doble Antideslizante':
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',

  'Transportadora Mediana':
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&q=80',

  'Cepillo Deslanador':
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80',

  'Arnés Ajustable':
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&q=80',

  'Premios Snacks Naturales':
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80',
};

const IMAGEN_DEFAULT =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80';

/* =========================================================
   COMPONENTE VISUAL DEL PROGRESO DEL PEDIDO
   ========================================================= */

function ProgresoPedido({ estado }) {
  const pasos = [
    {
      id: 'pedido',
      icono: '🛒',
      titulo: 'Pedido generado',
      descripcion: 'El pedido fue registrado correctamente.'
    },
    {
      id: 'correo',
      icono: '📧',
      titulo: 'Correo enviado',
      descripcion: 'Se enviaron las instrucciones de pago.'
    },
    {
      id: 'pago',
      icono: '💳',
      titulo: 'Pago',
      descripcion: 'Esperando confirmación del pago.'
    },
    {
      id: 'envio',
      icono: '🚚',
      titulo: 'Enviado',
      descripcion: 'El pedido se encuentra en camino.'
    },
    {
      id: 'entregado',
      icono: '🏠',
      titulo: 'Entregado',
      descripcion: 'El pedido fue entregado.'
    }
  ];

  /*
    El número representa hasta qué paso
    ha avanzado el pedido.
  */
  const indiceEstado = {
    PENDIENTE: 2,
    PENDIENTE_PAGO: 3,
    PAGADO: 4,
    ENVIADO: 5,
    ENTREGADO: 6
  };

  if (estado === 'CANCELADO') {
    return (
      <div className="progreso-cancelado">
        <div className="cancelado-icono">
          ❌
        </div>

        <div>
          <strong>
            Pedido cancelado
          </strong>

          <p>
            El pedido fue cancelado y las unidades
            regresaron al inventario.
          </p>
        </div>
      </div>
    );
  }

  const progreso =
    indiceEstado[estado] || 1;

  return (
    <div className="progreso-pedido">

      <div className="progreso-titulo">
        Seguimiento del pedido
      </div>

      {pasos.map((paso, index) => {
        const numeroPaso =
          index + 1;

        const completado =
          numeroPaso < progreso;

        const activo =
          numeroPaso === progreso;

        let descripcion =
          paso.descripcion;

        if (
          estado === 'PENDIENTE_PAGO' &&
          paso.id === 'pago'
        ) {
          descripcion =
            'Esperando confirmación de pago...';
        }

        if (
          estado === 'PAGADO' &&
          paso.id === 'envio'
        ) {
          descripcion =
            'Pago confirmado. Preparando el envío...';
        }

        if (
          estado === 'ENVIADO' &&
          paso.id === 'entregado'
        ) {
          descripcion =
            'El pedido va en camino al cliente...';
        }

        return (
          <div
            className="progreso-item"
            key={paso.id}
          >
            <div
              className={`progreso-icono ${
                completado
                  ? 'completado'
                  : activo
                  ? 'activo'
                  : ''
              }`}
            >
              {completado
                ? '✓'
                : paso.icono}
            </div>

            <div className="progreso-texto">
              <strong>
                {paso.titulo}
              </strong>

              <span>
                {descripcion}
              </span>
            </div>

            {index <
              pasos.length - 1 && (
              <div
                className={`progreso-linea ${
                  numeroPaso <
                  progreso
                    ? 'linea-completa'
                    : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   APLICACIÓN
   ========================================================= */

export default function App() {

  /* =======================================================
     LOGIN
     ======================================================= */

  const [email, setEmail] =
    useState('admin@huellitas.com');

  const [password, setPassword] =
    useState('admin123');

  const [usuarioActual, setUsuarioActual] =
    useState(null);

  const [cargandoLogin, setCargandoLogin] =
    useState(false);

  /* =======================================================
     NAVEGACIÓN
     ======================================================= */

  const [vista, setVista] =
    useState('tienda');

  /* =======================================================
     DATOS
     ======================================================= */

  const [productos, setProductos] =
    useState([]);

  const [pedidos, setPedidos] =
    useState([]);

  const [usuarios, setUsuarios] =
    useState([]);

  /* =======================================================
     CARRITO
     ======================================================= */

  const [carrito, setCarrito] =
    useState([]);

  /* =======================================================
     MENSAJES
     ======================================================= */

  const [mensaje, setMensaje] =
    useState(null);

  const [error, setError] =
    useState('');

  /* =======================================================
     NUEVO PRODUCTO
     ======================================================= */

  const [nuevoProducto, setNuevoProducto] =
    useState({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: ''
    });

  const esAdmin =
    usuarioActual?.rol === 'ADMIN';

  /* =======================================================
     CARGAR PRODUCTOS
     ======================================================= */

  const cargarProductos = async () => {
    const data =
      await productosApi.listar();

    setProductos(
      data.map((producto) => ({
        ...producto,

        precio:
          Number(producto.precio),

        stock:
          Number(producto.stock)
      }))
    );
  };

  /* =======================================================
     CARGAR PEDIDOS
     ======================================================= */

  const cargarPedidos = async () => {
    const data =
      await pedidosApi.listar();

    setPedidos(data);
  };

  /* =======================================================
     CARGAR USUARIOS
     ======================================================= */

  const cargarUsuarios = async () => {
    if (!esAdmin) {
      return;
    }

    const data =
      await usuariosApi.listar();

    setUsuarios(data);
  };

  /* =======================================================
     ACTUALIZAR TODA LA INFORMACIÓN
     ======================================================= */

  const actualizarTodo = async () => {
    try {
      setError('');

      await Promise.all([
        cargarProductos(),
        cargarPedidos(),

        esAdmin
          ? cargarUsuarios()
          : Promise.resolve()
      ]);
    } catch (err) {
      setError(
        err.message ||
        'Error al cargar los datos.'
      );
    }
  };

  useEffect(() => {
    if (!usuarioActual) {
      return;
    }

    actualizarTodo();
  }, [
    usuarioActual?.id,
    usuarioActual?.rol
  ]);

  /* =======================================================
     INICIAR SESIÓN
     ======================================================= */

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setCargandoLogin(true);
    setError('');
    setMensaje(null);

    try {
      const usuario =
        await usuariosApi.login({
          email,
          password
        });

      setUsuarioActual(
        usuario
      );

      setVista(
        'tienda'
      );
    } catch (err) {
      setError(
        err.message ||
        'Correo o contraseña incorrectos.'
      );
    } finally {
      setCargandoLogin(false);
    }
  };

  /* =======================================================
     CERRAR SESIÓN
     ======================================================= */

  const cerrarSesion = () => {
    setUsuarioActual(null);

    setCarrito([]);
    setProductos([]);
    setPedidos([]);
    setUsuarios([]);

    setMensaje(null);
    setError('');

    setVista(
      'tienda'
    );
  };

  /* =======================================================
     CARRITO
     ======================================================= */

  const cantidadEnCarrito =
    (productoId) => {
      const producto =
        carrito.find(
          (item) =>
            Number(item.id) ===
            Number(productoId)
        );

      return producto?.cantidad || 0;
    };

  const agregarAlCarrito =
    (producto, cantidad = 1) => {

      const actual =
        cantidadEnCarrito(
          producto.id
        );

      if (
        actual + cantidad >
        producto.stock
      ) {
        alert(
          `No hay suficiente stock.\n\n` +
          `Producto: ${producto.nombre}\n` +
          `Stock disponible: ${producto.stock}`
        );

        return;
      }

      setCarrito((anterior) => {

        const existente =
          anterior.find(
            (item) =>
              Number(item.id) ===
              Number(producto.id)
          );

        if (existente) {
          return anterior.map(
            (item) =>
              Number(item.id) ===
              Number(producto.id)
                ? {
                    ...item,

                    cantidad:
                      item.cantidad +
                      cantidad
                  }
                : item
          );
        }

        return [
          ...anterior,

          {
            ...producto,
            cantidad
          }
        ];
      });
    };

  const quitarUnaUnidad =
    (productoId) => {

      setCarrito((anterior) =>
        anterior
          .map((item) =>
            Number(item.id) ===
            Number(productoId)
              ? {
                  ...item,

                  cantidad:
                    item.cantidad - 1
                }
              : item
          )
          .filter(
            (item) =>
              item.cantidad > 0
          )
      );
    };

  const eliminarDelCarrito =
    (productoId) => {

      setCarrito((anterior) =>
        anterior.filter(
          (item) =>
            Number(item.id) !==
            Number(productoId)
        )
      );
    };

  const totalCarrito =
    useMemo(() => {

      return carrito.reduce(
        (total, item) =>
          total +
          Number(item.precio) *
          Number(item.cantidad),

        0
      );

    }, [carrito]);

  /* =======================================================
     ACT. 2.5
     GENERAR PEDIDO + CORREO CLIENTE + CORREO ADMIN
     ======================================================= */

  const finalizarCompra = async () => {

    if (carrito.length === 0) {
      alert(
        'El carrito está vacío.'
      );

      return;
    }

    if (!usuarioActual?.id) {
      alert(
        'Debes iniciar sesión.'
      );

      return;
    }

    setMensaje(null);
    setError('');

    try {

      /*
        El frontend únicamente manda:
        - usuario
        - producto
        - cantidad

        El backend:
        - valida stock
        - calcula total
        - crea pedido
        - descuenta stock
        - envía correos
      */

      const pedido =
        await pedidosApi.crear({

          usuario_id:
            usuarioActual.id,

          items:
            carrito.map(
              (item) => ({

                producto_id:
                  item.id,

                cantidad:
                  item.cantidad
              })
            )
        });

      const correoCliente =
        pedido
          .notificaciones
          ?.cliente
          ?.previewUrl;

      const correoAdmin =
        pedido
          .notificaciones
          ?.administrador
          ?.previewUrl;

      setCarrito([]);

      setMensaje({
        tipo:
          'pedido',

        texto:
          `✅ Pedido #${pedido.id} generado correctamente.`,

        total:
          Number(pedido.total),

        estado:
          pedido.estado,

        correoCliente,

        correoAdmin
      });

      await Promise.all([
        cargarProductos(),
        cargarPedidos()
      ]);

      setVista(
        'pedidos'
      );

    } catch (err) {

      setError(
        err.message ||
        'No se pudo generar el pedido.'
      );
    }
  };

  /* =======================================================
     PEDIDOS VISIBLES
     ======================================================= */

  const pedidosVisibles =
    useMemo(() => {

      if (esAdmin) {
        return pedidos;
      }

      return pedidos.filter(
        (pedido) =>
          Number(
            pedido.usuario_id
          ) ===
          Number(
            usuarioActual?.id
          )
      );

    }, [
      pedidos,
      usuarioActual,
      esAdmin
    ]);

  /* =======================================================
     CANCELAR PEDIDO
     ======================================================= */

  const cancelarPedido =
    async (pedido) => {

      const confirmar =
        window.confirm(
          `¿Deseas cancelar/eliminar ` +
          `el pedido #${pedido.id}?\n\n` +
          `Las unidades regresarán ` +
          `al inventario.`
        );

      if (!confirmar) {
        return;
      }

      try {

        await pedidosApi.eliminar(
          pedido.id
        );

        setMensaje(
          `✅ Pedido #${pedido.id} cancelado. ` +
          `El stock fue restaurado.`
        );

        await Promise.all([
          cargarPedidos(),
          cargarProductos()
        ]);

      } catch (err) {

        setError(
          err.message ||
          'No se pudo cancelar el pedido.'
        );
      }
    };

  /* =======================================================
     CAMBIAR ESTADO DEL PEDIDO
     ======================================================= */

  const cambiarEstadoPedido =
    async (
      pedidoId,
      nuevoEstado
    ) => {

      try {

        await pedidosApi.actualizar(
          pedidoId,
          {
            estado:
              nuevoEstado
          }
        );

        setMensaje(
          `✅ Estado del pedido #${pedidoId} ` +
          `actualizado a ${nuevoEstado}.`
        );

        await cargarPedidos();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo actualizar el estado.'
        );
      }
    };

  /* =======================================================
     CREAR PRODUCTO
     ======================================================= */

  const crearProducto =
    async (e) => {

      e.preventDefault();

      try {

        await productosApi.crear({

          nombre:
            nuevoProducto.nombre,

          descripcion:
            nuevoProducto.descripcion,

          precio:
            Number(
              nuevoProducto.precio
            ),

          stock:
            Number(
              nuevoProducto.stock
            )
        });

        setNuevoProducto({
          nombre: '',
          descripcion: '',
          precio: '',
          stock: ''
        });

        setMensaje(
          '✅ Producto creado correctamente.'
        );

        await cargarProductos();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo crear el producto.'
        );
      }
    };

  /* =======================================================
     EDITAR PRODUCTO
     ======================================================= */

  const editarProducto =
    async (producto) => {

      const nombre =
        window.prompt(
          'Nombre del producto:',
          producto.nombre
        );

      if (nombre === null) {
        return;
      }

      const descripcion =
        window.prompt(
          'Descripción:',
          producto.descripcion || ''
        );

      if (descripcion === null) {
        return;
      }

      const precio =
        window.prompt(
          'Precio:',
          producto.precio
        );

      if (precio === null) {
        return;
      }

      const stock =
        window.prompt(
          'Stock:',
          producto.stock
        );

      if (stock === null) {
        return;
      }

      try {

        await productosApi.actualizar(
          producto.id,
          {
            nombre,
            descripcion,

            precio:
              Number(precio),

            stock:
              Number(stock)
          }
        );

        setMensaje(
          `✅ Producto #${producto.id} actualizado correctamente.`
        );

        await cargarProductos();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo actualizar el producto.'
        );
      }
    };

  /* =======================================================
     ELIMINAR PRODUCTO
     ======================================================= */

  const eliminarProducto =
    async (producto) => {

      const confirmar =
        window.confirm(
          `¿Seguro que deseas eliminar "${producto.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {

        await productosApi.eliminar(
          producto.id
        );

        setMensaje(
          `✅ Producto "${producto.nombre}" eliminado.`
        );

        await cargarProductos();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo eliminar el producto.'
        );
      }
    };

  /* =======================================================
     EDITAR USUARIO
     ======================================================= */

  const editarUsuario =
    async (usuario) => {

      const nombre =
        window.prompt(
          'Nombre:',
          usuario.nombre
        );

      if (nombre === null) {
        return;
      }

      const rol =
        window.prompt(
          'Rol: USER o ADMIN',
          usuario.rol
        );

      if (rol === null) {
        return;
      }

      try {

        await usuariosApi.actualizar(
          usuario.id,
          {
            nombre,

            rol:
              rol.toUpperCase()
          }
        );

        setMensaje(
          `✅ Usuario #${usuario.id} actualizado.`
        );

        await cargarUsuarios();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo actualizar el usuario.'
        );
      }
    };

  /* =======================================================
     ELIMINAR USUARIO
     ======================================================= */

  const eliminarUsuario =
    async (usuario) => {

      if (
        Number(usuario.id) ===
        Number(usuarioActual?.id)
      ) {
        alert(
          'No puedes eliminar el usuario con el que tienes la sesión iniciada.'
        );

        return;
      }

      const confirmar =
        window.confirm(
          `¿Deseas eliminar al usuario "${usuario.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {

        await usuariosApi.eliminar(
          usuario.id
        );

        setMensaje(
          `✅ Usuario "${usuario.nombre}" eliminado.`
        );

        await cargarUsuarios();

      } catch (err) {

        setError(
          err.message ||
          'No se pudo eliminar el usuario.'
        );
      }
    };

  /* =======================================================
     OBTENER NOMBRE DEL USUARIO DE UN PEDIDO
     ======================================================= */

  const nombreUsuarioPedido =
    (pedido) => {

      const encontrado =
        usuarios.find(
          (usuario) =>
            Number(usuario.id) ===
            Number(pedido.usuario_id)
        );

      if (encontrado) {
        return encontrado.nombre;
      }

      if (
        Number(
          pedido.usuario_id
        ) ===
        Number(
          usuarioActual?.id
        )
      ) {
        return usuarioActual.nombre;
      }

      return `Usuario ${pedido.usuario_id}`;
    };

  /* =======================================================
     LOGIN
     ======================================================= */

  if (!usuarioActual) {

    return (
      <>
        <style>{css}</style>

        <div className="login-page">

          <form
            className="login-card"
            onSubmit={iniciarSesion}
          >

            <div className="login-logo">
              🐾
            </div>

            <h1>
              Huellitas E-Commerce
            </h1>

            <p>
              Inicia sesión para acceder
              a la tienda.
            </p>

            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            <label>
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              required
            />

            <label>
              Contraseña
            </label>

            <input
              type="password"
              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              required
            />

            <button
              className="btn-primary"
              type="submit"

              disabled={
                cargandoLogin
              }
            >
              {cargandoLogin
                ? 'Ingresando...'
                : 'Ingresar'}
            </button>

          </form>

        </div>
      </>
    );
  }

  /* =======================================================
     INTERFAZ PRINCIPAL
     ======================================================= */

  return (
    <>
      <style>{css}</style>

      <div className="app">

        {/* HEADER */}

        <header className="header">

          <div>
            <h1>
              🐾 Tienda Huellitas
            </h1>

            <p>
              Hola,{' '}

              <strong>
                {usuarioActual.nombre}
              </strong>

              {' · '}

              <span className="role">
                {usuarioActual.rol}
              </span>
            </p>
          </div>

          <button
            className="btn-danger"

            onClick={
              cerrarSesion
            }
          >
            Cerrar sesión
          </button>

        </header>

        {/* NAVEGACIÓN */}

        <nav className="navbar">

          <button
            className={
              vista === 'tienda'
                ? 'nav-active'
                : ''
            }

            onClick={() =>
              setVista('tienda')
            }
          >
            🛍️ Tienda
          </button>

          <button
            className={
              vista === 'pedidos'
                ? 'nav-active'
                : ''
            }

            onClick={() =>
              setVista('pedidos')
            }
          >
            📦 Pedidos ({pedidosVisibles.length})
          </button>

          <button
            className={
              vista === 'inventario'
                ? 'nav-active'
                : ''
            }

            onClick={() =>
              setVista(
                'inventario'
              )
            }
          >
            📊 Inventario
          </button>

          {esAdmin && (
            <button
              className={
                vista === 'usuarios'
                  ? 'nav-active'
                  : ''
              }

              onClick={() =>
                setVista(
                  'usuarios'
                )
              }
            >
              👥 Usuarios
            </button>
          )}

          <button
            onClick={
              actualizarTodo
            }
          >
            🔄 Actualizar
          </button>

        </nav>

        {/* MENSAJE DE ÉXITO */}

        {mensaje && (
          <div className="alert success">

            {typeof mensaje ===
            'string' ? (

              mensaje

            ) : (

              <div>

                <strong className="mensaje-principal">
                  {mensaje.texto}
                </strong>

                <div className="notification-data">

                  <div>
                    Estado:{' '}

                    <strong>
                      Pendiente de Pago
                    </strong>
                  </div>

                  <div>
                    Total:{' '}

                    <strong>
                      $
                      {Number(
                        mensaje.total
                      ).toFixed(2)}
                      {' '}MXN
                    </strong>
                  </div>

                </div>

                <div className="email-result">
                  📧 Se generó el correo de
                  confirmación para el cliente.

                  <br />

                  📬 El administrador también
                  fue notificado del nuevo pedido.
                </div>

                <div className="payment-notice">
                  💳 Revisa el correo para
                  consultar las instrucciones
                  y datos necesarios para
                  realizar el pago.
                </div>

                <ProgresoPedido
                  estado={
                    mensaje.estado ||
                    'PENDIENTE_PAGO'
                  }
                />

                {(mensaje.correoCliente ||
                  mensaje.correoAdmin) && (

                  <div className="email-buttons">

                    {mensaje.correoCliente && (
                      <a
                        href={
                          mensaje.correoCliente
                        }

                        target="_blank"

                        rel="noreferrer"

                        className="email-preview-button"
                      >
                        📧 Ver correo del cliente
                      </a>
                    )}

                    {mensaje.correoAdmin && (
                      <a
                        href={
                          mensaje.correoAdmin
                        }

                        target="_blank"

                        rel="noreferrer"

                        className="email-preview-button admin-mail"
                      >
                        📬 Ver correo del administrador
                      </a>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* =================================================
            TIENDA
            ================================================= */}

        {vista === 'tienda' && (

          <main className="store-layout">

            <section>

              <div className="title-row">

                <div>

                  <h2>
                    Catálogo de productos
                  </h2>

                  <p>
                    Productos obtenidos
                    directamente desde
                    PostgreSQL.
                  </p>

                </div>

                <div className="counter">
                  {productos.length}{' '}
                  productos
                </div>

              </div>

              <div className="products-grid">

                {productos.map(
                  (producto) => {

                    const enCarrito =
                      cantidadEnCarrito(
                        producto.id
                      );

                    const disponible =
                      producto.stock -
                      enCarrito;

                    return (

                      <article
                        className="product-card"
                        key={producto.id}
                      >

                        <img
                          src={
                            IMAGENES_PRODUCTOS[
                              producto.nombre
                            ] ||
                            IMAGEN_DEFAULT
                          }

                          alt={
                            producto.nombre
                          }
                        />

                        <div className="product-info">

                          <div className="product-id">
                            Producto #{producto.id}
                          </div>

                          <h3>
                            {producto.nombre}
                          </h3>

                          <p className="description">
                            {producto.descripcion ||
                              'Producto para el cuidado de tu mascota.'}
                          </p>

                          <div className="price">
                            $
                            {Number(
                              producto.precio
                            ).toFixed(2)}
                          </div>

                          <div
                            className={
                              producto.stock === 0
                                ? 'stock stock-zero'
                                : producto.stock <= 3
                                ? 'stock stock-low'
                                : 'stock stock-ok'
                            }
                          >

                            {producto.stock === 0
                              ? '🔴 Agotado'
                              : producto.stock <= 3
                              ? `🟠 Poco stock: ${producto.stock}`
                              : `🟢 Stock: ${producto.stock} unidades`}
                          </div>

                          {enCarrito > 0 && (

                            <div className="cart-stock">

                              En carrito:{' '}

                              <strong>
                                {enCarrito}
                              </strong>

                              <br />

                              Disponibles para agregar:{' '}

                              <strong>
                                {disponible}
                              </strong>

                            </div>
                          )}

                          <div className="product-actions">

                            <button
                              onClick={() =>
                                agregarAlCarrito(
                                  producto,
                                  1
                                )
                              }

                              disabled={
                                disponible < 1
                              }
                            >
                              Agregar 1
                            </button>

                            <button
                              onClick={() =>
                                agregarAlCarrito(
                                  producto,
                                  2
                                )
                              }

                              disabled={
                                disponible < 2
                              }
                            >
                              Agregar 2
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

              {productos.length === 0 && (

                <div className="empty">
                  No hay productos registrados.
                </div>

              )}

            </section>

            {/* CARRITO */}

            <aside className="cart-panel">

              <h2>
                🛒 Tu carrito
              </h2>

              {carrito.length === 0 && (

                <div className="empty-cart">

                  <div className="empty-icon">
                    🛒
                  </div>

                  <p>
                    No has agregado productos.
                  </p>

                </div>
              )}

              {carrito.map(
                (item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div>

                      <strong>
                        {item.nombre}
                      </strong>

                      <small>
                        {item.cantidad}{' '}
                        × $
                        {Number(
                          item.precio
                        ).toFixed(2)}
                      </small>

                    </div>

                    <div className="cart-item-right">

                      <strong>
                        $
                        {(
                          Number(item.precio) *
                          item.cantidad
                        ).toFixed(2)}
                      </strong>

                      <div>

                        <button
                          className="mini"

                          onClick={() =>
                            quitarUnaUnidad(
                              item.id
                            )
                          }
                        >
                          −1
                        </button>

                        <button
                          className="mini red"

                          onClick={() =>
                            eliminarDelCarrito(
                              item.id
                            )
                          }
                        >
                          Quitar
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

              {carrito.length > 0 && (

                <button
                  className="btn-secondary full"

                  onClick={() =>
                    setCarrito([])
                  }
                >
                  Vaciar carrito
                </button>

              )}

              <div className="total">

                <span>
                  Total del pedido
                </span>

                <strong>
                  $
                  {totalCarrito.toFixed(2)}
                  {' '}MXN
                </strong>

              </div>

              <div className="payment-info">

                <div className="payment-icon">
                  💳
                </div>

                <strong>
                  Transferencia bancaria
                </strong>

                <p>
                  El pedido se registrará como
                  <strong>
                    {' '}Pendiente de Pago
                  </strong>.
                </p>

                <p>
                  Las instrucciones bancarias
                  serán enviadas automáticamente
                  por correo electrónico.
                </p>

              </div>

              <button
                className="btn-primary full checkout"

                onClick={
                  finalizarCompra
                }

                disabled={
                  carrito.length === 0
                }
              >
                📦 Generar pedido
              </button>

              <p className="server-message">
                El backend valida el stock,
                calcula el total, registra el
                pedido y genera las
                notificaciones de correo.
              </p>

            </aside>

          </main>
        )}

        {/* =================================================
            PEDIDOS
            ================================================= */}

        {vista === 'pedidos' && (

          <main className="page-content">

            <div className="title-row">

              <div>

                <h2>
                  📦 Historial de pedidos
                </h2>

                <p>
                  {esAdmin
                    ? 'Como administrador puedes visualizar y actualizar todos los pedidos.'
                    : 'Aquí puedes consultar el estado de tus pedidos.'}
                </p>

              </div>

              <button
                className="btn-secondary"

                onClick={
                  cargarPedidos
                }
              >
                🔄 Actualizar pedidos
              </button>

            </div>

            <div className="orders-grid">

              {pedidosVisibles.map(
                (pedido) => (

                  <article
                    className="order-card"
                    key={pedido.id}
                  >

                    <div className="order-top">

                      <div>

                        <span className="pedido-id">
                          Pedido #{pedido.id}
                        </span>

                        <h3>
                          {nombreUsuarioPedido(
                            pedido
                          )}
                        </h3>

                      </div>

                      <span
                        className={`status ${String(
                          pedido.estado
                        ).toLowerCase()}`}
                      >
                        {pedido.estado ===
                        'PENDIENTE_PAGO'
                          ? 'PENDIENTE DE PAGO'
                          : pedido.estado}
                      </span>

                    </div>

                    <div className="order-info">

                      <div>

                        <span>
                          Total
                        </span>

                        <strong>
                          $
                          {Number(
                            pedido.total
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Usuario
                        </span>

                        <strong>
                          #{pedido.usuario_id}
                        </strong>

                      </div>

                    </div>

                    {pedido.creado_en && (

                      <p className="order-date">
                        📅{' '}

                        {new Date(
                          pedido.creado_en
                        ).toLocaleString(
                          'es-MX'
                        )}
                      </p>

                    )}

                    {pedido.estado ===
                      'PENDIENTE_PAGO' && (

                      <div className="pending-payment-box">
                        <span className="payment-pulse">
                          💳
                        </span>

                        <div>

                          <strong>
                            Esperando pago
                          </strong>

                          <p>
                            Las instrucciones fueron
                            enviadas por correo
                            electrónico.
                          </p>

                        </div>
                      </div>
                    )}

                    <ProgresoPedido
                      estado={
                        pedido.estado
                      }
                    />

                    {esAdmin && (

                      <div className="order-state">

                        <label>
                          Cambiar estado
                        </label>

                        <select
                          value={
                            pedido.estado
                          }

                          onChange={(e) =>
                            cambiarEstadoPedido(
                              pedido.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="PENDIENTE">
                            PENDIENTE
                          </option>

                          <option value="PENDIENTE_PAGO">
                            PENDIENTE DE PAGO
                          </option>

                          <option value="PAGADO">
                            PAGADO
                          </option>

                          <option value="ENVIADO">
                            ENVIADO
                          </option>

                          <option value="ENTREGADO">
                            ENTREGADO
                          </option>

                          <option value="CANCELADO">
                            CANCELADO
                          </option>

                        </select>

                      </div>
                    )}

                    <button
                      className="btn-cancel"

                      onClick={() =>
                        cancelarPedido(
                          pedido
                        )
                      }
                    >
                      ❌ Cancelar / eliminar pedido
                    </button>

                    <small className="restore-text">
                      Al eliminar el pedido,
                      las unidades regresan
                      automáticamente al inventario.
                    </small>

                  </article>
                )
              )}

            </div>

            {pedidosVisibles.length === 0 && (

              <div className="empty">
                📦 No hay pedidos registrados.
              </div>

            )}

          </main>
        )}

        {/* =================================================
            INVENTARIO
            ================================================= */}

        {vista === 'inventario' && (

          <main className="page-content">

            <div className="title-row">

              <div>

                <h2>
                  📊 Inventario y Stock
                </h2>

                <p>
                  Información actualizada
                  directamente desde PostgreSQL.
                </p>

              </div>

              <button
                className="btn-secondary"

                onClick={
                  cargarProductos
                }
              >
                🔄 Actualizar stock
              </button>

            </div>

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon">
                  📦
                </div>

                <div>

                  <span>
                    Productos diferentes
                  </span>

                  <strong>
                    {productos.length}
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  🐾
                </div>

                <div>

                  <span>
                    Unidades disponibles
                  </span>

                  <strong>
                    {productos.reduce(
                      (
                        total,
                        producto
                      ) =>
                        total +
                        Number(
                          producto.stock
                        ),

                      0
                    )}
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  ⚠️
                </div>

                <div>

                  <span>
                    Poco stock
                  </span>

                  <strong>
                    {
                      productos.filter(
                        (producto) =>
                          producto.stock <= 3 &&
                          producto.stock > 0
                      ).length
                    }
                  </strong>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  🚫
                </div>

                <div>

                  <span>
                    Agotados
                  </span>

                  <strong>
                    {
                      productos.filter(
                        (producto) =>
                          producto.stock === 0
                      ).length
                    }
                  </strong>

                </div>

              </div>

            </div>

            {/* CREAR PRODUCTO */}

            {esAdmin && (

              <section className="create-product">

                <h3>
                  ➕ Agregar nuevo producto
                </h3>

                <p>
                  La imagen se administra
                  desde React y no se almacena
                  en PostgreSQL.
                </p>

                <form
                  onSubmit={
                    crearProducto
                  }

                  className="product-form"
                >

                  <input
                    placeholder="Nombre"

                    value={
                      nuevoProducto.nombre
                    }

                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,

                        nombre:
                          e.target.value
                      })
                    }

                    required
                  />

                  <input
                    placeholder="Descripción"

                    value={
                      nuevoProducto.descripcion
                    }

                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,

                        descripcion:
                          e.target.value
                      })
                    }
                  />

                  <input
                    type="number"

                    min="0.01"

                    step="0.01"

                    placeholder="Precio"

                    value={
                      nuevoProducto.precio
                    }

                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,

                        precio:
                          e.target.value
                      })
                    }

                    required
                  />

                  <input
                    type="number"

                    min="0"

                    step="1"

                    placeholder="Stock"

                    value={
                      nuevoProducto.stock
                    }

                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,

                        stock:
                          e.target.value
                      })
                    }

                    required
                  />

                  <button
                    className="btn-primary"
                    type="submit"
                  >
                    Guardar producto
                  </button>

                </form>

              </section>
            )}

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>
                      Producto
                    </th>

                    <th>
                      Descripción
                    </th>

                    <th>
                      Precio
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Estado
                    </th>

                    {esAdmin && (
                      <th>
                        Acciones
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {productos.map(
                    (producto) => (

                      <tr
                        key={
                          producto.id
                        }
                      >

                        <td>
                          #{producto.id}
                        </td>

                        <td>

                          <strong>
                            {producto.nombre}
                          </strong>

                        </td>

                        <td>
                          {producto.descripcion ||
                            '—'}
                        </td>

                        <td>
                          $
                          {Number(
                            producto.precio
                          ).toFixed(2)}
                        </td>

                        <td>

                          <span className="stock-number">
                            {producto.stock}
                          </span>

                        </td>

                        <td>

                          {producto.stock === 0 ? (

                            <span className="badge red-badge">
                              AGOTADO
                            </span>

                          ) : producto.stock <= 3 ? (

                            <span className="badge orange-badge">
                              POCO STOCK
                            </span>

                          ) : (

                            <span className="badge green-badge">
                              DISPONIBLE
                            </span>

                          )}

                        </td>

                        {esAdmin && (

                          <td>

                            <div className="actions">

                              <button
                                className="btn-edit"

                                onClick={() =>
                                  editarProducto(
                                    producto
                                  )
                                }
                              >
                                ✏️ Editar
                              </button>

                              <button
                                className="btn-delete"

                                onClick={() =>
                                  eliminarProducto(
                                    producto
                                  )
                                }
                              >
                                🗑️ Eliminar
                              </button>

                            </div>

                          </td>
                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </main>
        )}

        {/* =================================================
            USUARIOS
            ================================================= */}

        {vista === 'usuarios' &&
          esAdmin && (

            <main className="page-content">

              <div className="title-row">

                <div>

                  <h2>
                    👥 Usuarios registrados
                  </h2>

                  <p>
                    Las contraseñas no se
                    muestran porque están
                    protegidas con Bcrypt.
                  </p>

                </div>

                <button
                  className="btn-secondary"

                  onClick={
                    cargarUsuarios
                  }
                >
                  🔄 Actualizar usuarios
                </button>

              </div>

              <div className="stats-grid users-stats">

                <div className="stat-card">

                  <div className="stat-icon">
                    👥
                  </div>

                  <div>

                    <span>
                      Total usuarios
                    </span>

                    <strong>
                      {usuarios.length}
                    </strong>

                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    👑
                  </div>

                  <div>

                    <span>
                      Administradores
                    </span>

                    <strong>
                      {
                        usuarios.filter(
                          (u) =>
                            u.rol === 'ADMIN'
                        ).length
                      }
                    </strong>

                  </div>

                </div>

              </div>

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>ID</th>

                      <th>
                        Nombre
                      </th>

                      <th>
                        Correo
                      </th>

                      <th>
                        Rol
                      </th>

                      <th>
                        Contraseña
                      </th>

                      <th>
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {usuarios.map(
                      (usuario) => (

                        <tr
                          key={
                            usuario.id
                          }
                        >

                          <td>
                            #{usuario.id}
                          </td>

                          <td>

                            <strong>
                              {usuario.nombre}
                            </strong>

                          </td>

                          <td>
                            {usuario.email}
                          </td>

                          <td>

                            <span
                              className={
                                usuario.rol ===
                                'ADMIN'
                                  ? 'badge admin-badge'
                                  : 'badge user-badge'
                              }
                            >
                              {usuario.rol}
                            </span>

                          </td>

                          <td>
                            🔒 Protegida con Bcrypt
                          </td>

                          <td>

                            <div className="actions">

                              <button
                                className="btn-edit"

                                onClick={() =>
                                  editarUsuario(
                                    usuario
                                  )
                                }
                              >
                                ✏️ Editar
                              </button>

                              <button
                                className="btn-delete"

                                onClick={() =>
                                  eliminarUsuario(
                                    usuario
                                  )
                                }
                              >
                                🗑️ Eliminar
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </main>
          )}

      </div>
    </>
  );
}

/* =========================================================
   ESTILOS
   ========================================================= */

const css = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;

  background:
    #f7f8fc;

  color:
    #1e293b;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

/* =========================================================
   LOGIN
   ========================================================= */

.login-page {
  min-height: 100vh;

  background:
    linear-gradient(
      135deg,
      #eef2ff,
      #f8fafc
    );

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 25px;
}

.login-card {
  width: 100%;

  max-width:
    430px;

  background:
    white;

  border-radius:
    22px;

  padding:
    38px;

  display: flex;

  flex-direction:
    column;

  gap:
    12px;

  box-shadow:
    0 20px 50px
    rgba(
      15,
      23,
      42,
      0.12
    );
}

.login-logo {
  width: 70px;
  height: 70px;

  margin:
    0 auto;

  border-radius:
    50%;

  display:
    grid;

  place-items:
    center;

  font-size:
    35px;

  background:
    #e9efff;
}

.login-card h1 {
  text-align:
    center;

  color:
    #2459d8;

  margin:
    5px 0;
}

.login-card p {
  text-align:
    center;

  color:
    #64748b;
}

/* =========================================================
   INPUTS
   ========================================================= */

input,
select {
  width: 100%;

  border:
    1px solid
    #cbd5e1;

  border-radius:
    9px;

  padding:
    12px 13px;

  background:
    white;
}

input:focus,
select:focus {
  outline:
    2px solid
    #bfdbfe;

  border-color:
    #2563eb;
}

/* =========================================================
   HEADER
   ========================================================= */

.app {
  min-height:
    100vh;
}

.header {
  background:
    white;

  padding:
    22px 38px;

  display:
    flex;

  justify-content:
    space-between;

  align-items:
    center;

  gap:
    20px;

  flex-wrap:
    wrap;

  border-bottom:
    1px solid
    #e2e8f0;
}

.header h1 {
  margin:
    0;

  color:
    #2459d8;
}

.header p {
  margin:
    6px 0 0;

  color:
    #64748b;
}

.role {
  background:
    #e0e7ff;

  color:
    #3730a3;

  border-radius:
    20px;

  padding:
    4px 10px;

  font-size:
    12px;

  font-weight:
    bold;
}

/* =========================================================
   NAV
   ========================================================= */

.navbar {
  background:
    white;

  padding:
    14px 38px;

  display:
    flex;

  gap:
    10px;

  flex-wrap:
    wrap;

  border-bottom:
    1px solid
    #e2e8f0;
}

.navbar button {
  padding:
    10px 15px;

  border:
    1px solid
    #cbd5e1;

  background:
    white;

  border-radius:
    9px;

  color:
    #334155;

  font-weight:
    bold;
}

.navbar button:hover {
  background:
    #f1f5f9;
}

.navbar .nav-active {
  color:
    white;

  background:
    #2864e8;

  border-color:
    #2864e8;
}

/* =========================================================
   ALERTAS
   ========================================================= */

.alert {
  margin:
    18px 38px 0;

  padding:
    14px 18px;

  border-radius:
    10px;

  font-weight:
    600;
}

.success {
  background:
    #ecfdf5;

  color:
    #166534;

  border:
    1px solid
    #bbf7d0;
}

.error {
  background:
    #fef2f2;

  color:
    #b91c1c;

  border:
    1px solid
    #fecaca;
}

.mensaje-principal {
  font-size:
    18px;
}

.notification-data {
  margin-top:
    10px;

  line-height:
    1.7;
}

.email-result {
  margin-top:
    12px;

  line-height:
    1.7;
}

.payment-notice {
  margin-top:
    12px;

  padding:
    12px;

  background:
    rgba(
      255,
      255,
      255,
      0.7
    );

  border-radius:
    8px;
}

.email-buttons {
  display:
    flex;

  flex-wrap:
    wrap;

  gap:
    10px;

  margin-top:
    15px;
}

.email-preview-button {
  display:
    inline-block;

  text-decoration:
    none;

  background:
    #2864e8;

  color:
    white;

  padding:
    10px 14px;

  border-radius:
    8px;

  font-size:
    13px;

  font-weight:
    bold;
}

.email-preview-button:hover {
  background:
    #1d4ed8;
}

.email-preview-button.admin-mail {
  background:
    #7c3aed;
}

.email-preview-button.admin-mail:hover {
  background:
    #6d28d9;
}

/* =========================================================
   TIENDA
   ========================================================= */

.store-layout {
  display:
    grid;

  grid-template-columns:
    minmax(
      0,
      1fr
    )
    350px;

  gap:
    30px;

  padding:
    38px;

  align-items:
    start;
}

.page-content {
  padding:
    38px;
}

.title-row {
  display:
    flex;

  justify-content:
    space-between;

  align-items:
    center;

  gap:
    20px;

  flex-wrap:
    wrap;

  margin-bottom:
    25px;
}

.title-row h2 {
  margin:
    0;
}

.title-row p {
  margin:
    7px 0 0;

  color:
    #64748b;
}

.counter {
  padding:
    9px 14px;

  border-radius:
    20px;

  background:
    #e9efff;

  color:
    #2459d8;

  font-weight:
    bold;
}

.products-grid {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(
        235px,
        1fr
      )
    );

  gap:
    22px;
}

.product-card {
  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    17px;

  overflow:
    hidden;

  box-shadow:
    0 6px 18px
    rgba(
      15,
      23,
      42,
      0.06
    );

  transition:
    0.2s;
}

.product-card:hover {
  transform:
    translateY(-3px);

  box-shadow:
    0 12px 28px
    rgba(
      15,
      23,
      42,
      0.1
    );
}

.product-card img {
  display:
    block;

  width:
    100%;

  height:
    190px;

  object-fit:
    cover;

  background:
    #e2e8f0;
}

.product-info {
  padding:
    18px;
}

.product-id {
  color:
    #94a3b8;

  font-size:
    12px;

  font-weight:
    bold;
}

.product-info h3 {
  margin:
    6px 0;

  min-height:
    48px;
}

.description {
  color:
    #64748b;

  font-size:
    14px;

  min-height:
    38px;
}

.price {
  color:
    #16a34a;

  font-size:
    25px;

  font-weight:
    800;

  margin:
    13px 0;
}

.stock {
  padding:
    9px 10px;

  border-radius:
    8px;

  font-size:
    14px;

  font-weight:
    bold;
}

.stock-ok {
  background:
    #ecfdf5;

  color:
    #166534;

  border:
    1px solid
    #bbf7d0;
}

.stock-low {
  background:
    #fff7ed;

  color:
    #c2410c;

  border:
    1px solid
    #fed7aa;
}

.stock-zero {
  background:
    #fef2f2;

  color:
    #b91c1c;

  border:
    1px solid
    #fecaca;
}

.cart-stock {
  margin-top:
    9px;

  background:
    #f8fafc;

  padding:
    8px;

  border-radius:
    7px;

  font-size:
    13px;

  color:
    #475569;
}

.product-actions {
  display:
    flex;

  gap:
    8px;

  margin-top:
    12px;
}

.product-actions button {
  flex:
    1;

  border:
    1px solid
    #cbd5e1;

  background:
    #f8fafc;

  padding:
    9px;

  border-radius:
    8px;

  font-weight:
    bold;
}

.product-actions button:hover:not(:disabled) {
  background:
    #e2e8f0;
}

/* =========================================================
   CARRITO
   ========================================================= */

.cart-panel {
  position:
    sticky;

  top:
    15px;

  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    17px;

  padding:
    22px;

  box-shadow:
    0 6px 18px
    rgba(
      15,
      23,
      42,
      0.06
    );
}

.cart-panel h2 {
  margin-top:
    0;
}

.empty-cart {
  text-align:
    center;

  color:
    #64748b;

  padding:
    20px;
}

.empty-icon {
  font-size:
    40px;

  opacity:
    0.45;
}

.cart-item {
  padding:
    13px 0;

  display:
    flex;

  justify-content:
    space-between;

  gap:
    12px;

  border-bottom:
    1px solid
    #e2e8f0;
}

.cart-item small {
  display:
    block;

  color:
    #64748b;

  margin-top:
    4px;
}

.cart-item-right {
  flex-shrink:
    0;

  text-align:
    right;
}

.mini {
  margin-top:
    7px;

  margin-right:
    4px;

  padding:
    5px 8px;

  border-radius:
    6px;

  border:
    1px solid
    #cbd5e1;

  background:
    white;
}

.mini.red {
  color:
    #b91c1c;

  background:
    #fff1f2;

  border-color:
    #fecaca;
}

.total {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    10px;

  font-size:
    19px;

  padding:
    20px 0;
}

.payment-info {
  margin-top:
    12px;

  padding:
    15px;

  background:
    #eff6ff;

  color:
    #1e40af;

  border:
    1px solid
    #bfdbfe;

  border-radius:
    10px;
}

.payment-info p {
  font-size:
    13px;

  line-height:
    1.5;
}

.payment-icon {
  font-size:
    28px;

  margin-bottom:
    7px;
}

.checkout {
  margin-top:
    15px;
}

.full {
  width:
    100%;
}

.server-message {
  font-size:
    12px;

  line-height:
    1.5;

  color:
    #94a3b8;

  text-align:
    center;

  margin-top:
    13px;
}

/* =========================================================
   BOTONES
   ========================================================= */

.btn-primary {
  background:
    #2864e8;

  color:
    white;

  border:
    0;

  padding:
    12px 18px;

  border-radius:
    9px;

  font-weight:
    bold;
}

.btn-primary:hover:not(:disabled) {
  background:
    #1d4ed8;
}

.btn-secondary {
  background:
    #f8fafc;

  color:
    #334155;

  border:
    1px solid
    #cbd5e1;

  padding:
    10px 14px;

  border-radius:
    8px;

  font-weight:
    bold;
}

.btn-danger {
  background:
    #ef4444;

  color:
    white;

  border:
    0;

  padding:
    11px 16px;

  border-radius:
    9px;

  font-weight:
    bold;
}

/* =========================================================
   PEDIDOS
   ========================================================= */

.orders-grid {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(
        320px,
        1fr
      )
    );

  gap:
    20px;
}

.order-card {
  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    16px;

  padding:
    21px;

  box-shadow:
    0 5px 15px
    rgba(
      15,
      23,
      42,
      0.05
    );
}

.order-top {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    12px;
}

.order-top h3 {
  margin:
    6px 0;
}

.pedido-id {
  color:
    #64748b;

  font-size:
    13px;
}

.status {
  height:
    fit-content;

  border-radius:
    20px;

  padding:
    6px 10px;

  font-size:
    11px;

  font-weight:
    bold;

  background:
    #e2e8f0;
}

.status.pagado {
  background:
    #dcfce7;

  color:
    #166534;
}

.status.pendiente {
  background:
    #fef3c7;

  color:
    #92400e;
}

.status.pendiente_pago {
  background:
    #ffedd5;

  color:
    #c2410c;
}

.status.enviado {
  background:
    #dbeafe;

  color:
    #1e40af;
}

.status.entregado {
  background:
    #ede9fe;

  color:
    #5b21b6;
}

.status.cancelado {
  background:
    #fee2e2;

  color:
    #991b1b;
}

.order-info {
  display:
    grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    12px;

  margin:
    18px 0;
}

.order-info div {
  background:
    #f8fafc;

  padding:
    12px;

  border-radius:
    9px;
}

.order-info span,
.order-info strong {
  display:
    block;
}

.order-info span {
  color:
    #64748b;

  font-size:
    12px;
}

.order-info strong {
  margin-top:
    4px;
}

.order-date {
  color:
    #64748b;

  font-size:
    13px;
}

/* =========================================================
   ESPERANDO PAGO
   ========================================================= */

.pending-payment-box {
  margin:
    12px 0;

  padding:
    13px;

  display:
    flex;

  gap:
    13px;

  align-items:
    center;

  background:
    #fff7ed;

  color:
    #9a3412;

  border:
    1px solid
    #fed7aa;

  border-radius:
    10px;
}

.pending-payment-box p {
  margin:
    4px 0 0;

  font-size:
    12px;
}

.payment-pulse {
  width:
    45px;

  height:
    45px;

  display:
    grid;

  place-items:
    center;

  flex-shrink:
    0;

  font-size:
    22px;

  border-radius:
    50%;

  background:
    #ffedd5;

  animation:
    pulsoPago
    1.5s infinite;
}

/* =========================================================
   PROGRESO DEL PEDIDO
   ========================================================= */

.progreso-pedido {
  margin-top:
    20px;

  background:
    #f8fafc;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    14px;

  padding:
    18px;
}

.progreso-titulo {
  font-size:
    14px;

  font-weight:
    bold;

  color:
    #334155;

  margin-bottom:
    16px;
}

.progreso-item {
  position:
    relative;

  display:
    flex;

  gap:
    13px;

  min-height:
    70px;
}

.progreso-icono {
  position:
    relative;

  z-index:
    2;

  width:
    42px;

  height:
    42px;

  flex-shrink:
    0;

  display:
    grid;

  place-items:
    center;

  border-radius:
    50%;

  background:
    #f1f5f9;

  border:
    2px solid
    #cbd5e1;

  font-size:
    18px;

  transition:
    all 0.3s ease;
}

.progreso-icono.completado {
  background:
    #22c55e;

  border-color:
    #22c55e;

  color:
    white;

  font-weight:
    bold;

  animation:
    aparecerCheck
    0.5s ease;
}

.progreso-icono.activo {
  background:
    #fff7ed;

  border-color:
    #f97316;

  animation:
    pulsoPago
    1.5s infinite;
}

.progreso-texto {
  padding-top:
    2px;
}

.progreso-texto strong {
  display:
    block;

  color:
    #1e293b;

  margin-bottom:
    4px;
}

.progreso-texto span {
  color:
    #64748b;

  font-size:
    13px;

  line-height:
    1.4;
}

.progreso-linea {
  position:
    absolute;

  width:
    3px;

  height:
    38px;

  left:
    20px;

  top:
    41px;

  background:
    #e2e8f0;

  z-index:
    1;

  overflow:
    hidden;
}

.progreso-linea.linea-completa {
  background:
    #22c55e;

  animation:
    llenarLinea
    0.7s ease;
}

.progreso-cancelado {
  margin-top:
    18px;

  display:
    flex;

  align-items:
    center;

  gap:
    14px;

  padding:
    15px;

  border-radius:
    12px;

  background:
    #fef2f2;

  border:
    1px solid
    #fecaca;

  color:
    #991b1b;
}

.cancelado-icono {
  width:
    45px;

  height:
    45px;

  flex-shrink:
    0;

  display:
    grid;

  place-items:
    center;

  border-radius:
    50%;

  background:
    #fee2e2;

  font-size:
    22px;

  animation:
    aparecerCheck
    0.5s ease;
}

.progreso-cancelado p {
  margin:
    5px 0 0;

  font-size:
    13px;
}

/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

.order-state label {
  display:
    block;

  margin:
    16px 0 7px;

  font-weight:
    bold;

  font-size:
    13px;
}

.btn-cancel {
  width:
    100%;

  margin-top:
    14px;

  padding:
    10px;

  border-radius:
    8px;

  border:
    1px solid
    #fecaca;

  background:
    #fff1f2;

  color:
    #b91c1c;

  font-weight:
    bold;
}

.restore-text {
  display:
    block;

  color:
    #94a3b8;

  margin-top:
    8px;

  text-align:
    center;
}

/* =========================================================
   INVENTARIO
   ========================================================= */

.stats-grid {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(
        190px,
        1fr
      )
    );

  gap:
    17px;

  margin-bottom:
    25px;
}

.stat-card {
  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    14px;

  padding:
    20px;

  display:
    flex;

  align-items:
    center;

  gap:
    15px;
}

.stat-icon {
  width:
    52px;

  height:
    52px;

  border-radius:
    13px;

  background:
    #eef2ff;

  display:
    grid;

  place-items:
    center;

  font-size:
    24px;
}

.stat-card span {
  display:
    block;

  color:
    #64748b;

  font-size:
    13px;
}

.stat-card strong {
  display:
    block;

  font-size:
    30px;

  color:
    #2459d8;

  margin-top:
    3px;
}

.create-product {
  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    14px;

  padding:
    20px;

  margin-bottom:
    25px;
}

.create-product h3 {
  margin-top:
    0;
}

.create-product p {
  color:
    #64748b;
}

.product-form {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(
        170px,
        1fr
      )
    );

  gap:
    10px;
}

/* =========================================================
   TABLAS
   ========================================================= */

.table-container {
  overflow-x:
    auto;

  background:
    white;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    14px;
}

table {
  width:
    100%;

  border-collapse:
    collapse;

  min-width:
    850px;
}

th {
  text-align:
    left;

  background:
    #f8fafc;

  padding:
    14px;

  border-bottom:
    1px solid
    #e2e8f0;

  color:
    #475569;
}

td {
  padding:
    14px;

  border-bottom:
    1px solid
    #edf2f7;
}

tr:hover td {
  background:
    #fafafa;
}

.stock-number {
  font-size:
    18px;

  font-weight:
    bold;
}

/* =========================================================
   BADGES
   ========================================================= */

.badge {
  display:
    inline-block;

  border-radius:
    20px;

  padding:
    6px 10px;

  font-size:
    11px;

  font-weight:
    bold;
}

.green-badge {
  background:
    #dcfce7;

  color:
    #166534;
}

.orange-badge {
  background:
    #ffedd5;

  color:
    #c2410c;
}

.red-badge {
  background:
    #fee2e2;

  color:
    #b91c1c;
}

.admin-badge {
  background:
    #e0e7ff;

  color:
    #3730a3;
}

.user-badge {
  background:
    #e2e8f0;

  color:
    #334155;
}

/* =========================================================
   ACCIONES
   ========================================================= */

.actions {
  display:
    flex;

  gap:
    6px;

  flex-wrap:
    wrap;
}

.btn-edit,
.btn-delete {
  border:
    0;

  padding:
    7px 9px;

  border-radius:
    7px;

  font-size:
    12px;

  font-weight:
    bold;
}

.btn-edit {
  background:
    #dbeafe;

  color:
    #1d4ed8;
}

.btn-delete {
  background:
    #fee2e2;

  color:
    #b91c1c;
}

.empty {
  background:
    white;

  border:
    1px dashed
    #cbd5e1;

  border-radius:
    13px;

  padding:
    35px;

  text-align:
    center;

  color:
    #64748b;
}

.users-stats {
  max-width:
    600px;
}

/* =========================================================
   ANIMACIONES
   ========================================================= */

@keyframes pulsoPago {

  0% {
    box-shadow:
      0 0 0 0
      rgba(
        249,
        115,
        22,
        0.45
      );
  }

  70% {
    box-shadow:
      0 0 0 12px
      rgba(
        249,
        115,
        22,
        0
      );
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(
        249,
        115,
        22,
        0
      );
  }
}

@keyframes aparecerCheck {

  0% {
    transform:
      scale(0.6);

    opacity:
      0;
  }

  70% {
    transform:
      scale(1.15);
  }

  100% {
    transform:
      scale(1);

    opacity:
      1;
  }
}

@keyframes llenarLinea {

  from {
    transform:
      scaleY(0);

    transform-origin:
      top;
  }

  to {
    transform:
      scaleY(1);

    transform-origin:
      top;
  }
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (
  max-width:
  950px
) {

  .store-layout {
    grid-template-columns:
      1fr;
  }

  .cart-panel {
    position:
      static;
  }
}

@media (
  max-width:
  600px
) {

  .header,
  .navbar,
  .page-content,
  .store-layout {
    padding-left:
      18px;

    padding-right:
      18px;
  }

  .alert {
    margin-left:
      18px;

    margin-right:
      18px;
  }

  .products-grid {
    grid-template-columns:
      1fr;
  }

  .orders-grid {
    grid-template-columns:
      1fr;
  }
}
`;