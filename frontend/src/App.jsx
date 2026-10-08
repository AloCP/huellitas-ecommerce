import React, { useEffect, useMemo, useState } from 'react';
import { usuariosApi, productosApi, pedidosApi } from './services/api';

/*
  Las imágenes NO se guardan en PostgreSQL.
  Únicamente se relacionan visualmente desde el frontend.
*/
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
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80'
};

const IMAGEN_DEFAULT =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80';

export default function App() {
  // LOGIN
  const [email, setEmail] = useState('admin@huellitas.com');
  const [password, setPassword] = useState('admin123');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoLogin, setCargandoLogin] = useState(false);

  // NAVEGACIÓN
  const [vista, setVista] = useState('tienda');

  // DATOS
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // CARRITO
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('SPEI');

  // MENSAJES
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // CREAR PRODUCTO
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: ''
  });

  const esAdmin = usuarioActual?.rol === 'ADMIN';

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  const cargarProductos = async () => {
    const data = await productosApi.listar();

    setProductos(
      data.map((producto) => ({
        ...producto,
        precio: Number(producto.precio),
        stock: Number(producto.stock)
      }))
    );
  };

  const cargarPedidos = async () => {
    const data = await pedidosApi.listar();
    setPedidos(data);
  };

  const cargarUsuarios = async () => {
    if (!esAdmin) return;

    const data = await usuariosApi.listar();
    setUsuarios(data);
  };

  const actualizarTodo = async () => {
    try {
      setError('');

      await Promise.all([
        cargarProductos(),
        cargarPedidos(),
        esAdmin ? cargarUsuarios() : Promise.resolve()
      ]);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos.');
    }
  };

  useEffect(() => {
    if (!usuarioActual) return;

    actualizarTodo();
  }, [usuarioActual?.id, usuarioActual?.rol]);

  // =========================================================
  // LOGIN
  // =========================================================

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setCargandoLogin(true);
    setError('');
    setMensaje('');

    try {
      const usuario = await usuariosApi.login({
        email,
        password
      });

      setUsuarioActual(usuario);
      setVista('tienda');
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
    } finally {
      setCargandoLogin(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
    setCarrito([]);
    setProductos([]);
    setPedidos([]);
    setUsuarios([]);
    setMensaje('');
    setError('');
    setVista('tienda');
  };

  // =========================================================
  // CARRITO
  // =========================================================

  const cantidadEnCarrito = (productoId) => {
    const producto = carrito.find(
      (item) => Number(item.id) === Number(productoId)
    );

    return producto?.cantidad || 0;
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    const actual = cantidadEnCarrito(producto.id);

    if (actual + cantidad > producto.stock) {
      alert(
        `No hay suficiente stock.\n\nProducto: ${producto.nombre}\nStock disponible: ${producto.stock}`
      );
      return;
    }

    setCarrito((anterior) => {
      const existente = anterior.find(
        (item) => Number(item.id) === Number(producto.id)
      );

      if (existente) {
        return anterior.map((item) =>
          Number(item.id) === Number(producto.id)
            ? {
                ...item,
                cantidad: item.cantidad + cantidad
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

  const quitarUnaUnidad = (productoId) => {
    setCarrito((anterior) =>
      anterior
        .map((item) =>
          Number(item.id) === Number(productoId)
            ? {
                ...item,
                cantidad: item.cantidad - 1
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito((anterior) =>
      anterior.filter(
        (item) => Number(item.id) !== Number(productoId)
      )
    );
  };

  const totalCarrito = useMemo(() => {
    return carrito.reduce(
      (total, item) =>
        total + Number(item.precio) * Number(item.cantidad),
      0
    );
  }, [carrito]);

  // =========================================================
  // CREAR PEDIDO
  // =========================================================

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    if (!usuarioActual?.id) {
      alert('Debes iniciar sesión.');
      return;
    }

    setMensaje('');
    setError('');

    try {
      const pedido = await pedidosApi.crear({
        usuario_id: usuarioActual.id,

        items: carrito.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }))
      });

      setCarrito([]);

      setMensaje(
        `✅ Compra realizada correctamente. Pedido #${pedido.id}. Total: $${Number(
          pedido.total
        ).toFixed(2)} MXN`
      );

      /*
        Después de comprar volvemos a consultar PostgreSQL.
        Así el nuevo stock se muestra automáticamente.
      */
      await Promise.all([
        cargarProductos(),
        cargarPedidos()
      ]);

      setVista('pedidos');
    } catch (err) {
      setError(err.message || 'No se pudo realizar la compra.');
    }
  };

  // =========================================================
  // PEDIDOS
  // =========================================================

  const pedidosVisibles = useMemo(() => {
    if (esAdmin) {
      return pedidos;
    }

    return pedidos.filter(
      (pedido) =>
        Number(pedido.usuario_id) === Number(usuarioActual?.id)
    );
  }, [pedidos, usuarioActual, esAdmin]);

  const cancelarPedido = async (pedido) => {
    const confirmar = window.confirm(
      `¿Deseas cancelar/eliminar el pedido #${pedido.id}?\n\nLas unidades regresarán al inventario.`
    );

    if (!confirmar) return;

    try {
      await pedidosApi.eliminar(pedido.id);

      setMensaje(
        `✅ Pedido #${pedido.id} cancelado. El stock fue restaurado.`
      );

      await Promise.all([
        cargarPedidos(),
        cargarProductos()
      ]);
    } catch (err) {
      setError(err.message || 'No se pudo cancelar el pedido.');
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      await pedidosApi.actualizar(pedidoId, {
        estado: nuevoEstado
      });

      setMensaje(
        `✅ Estado del pedido #${pedidoId} actualizado a ${nuevoEstado}.`
      );

      await cargarPedidos();
    } catch (err) {
      setError(
        err.message || 'No se pudo actualizar el estado.'
      );
    }
  };

  // =========================================================
  // PRODUCTOS - CRUD
  // =========================================================

  const crearProducto = async (e) => {
    e.preventDefault();

    try {
      await productosApi.crear({
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        precio: Number(nuevoProducto.precio),
        stock: Number(nuevoProducto.stock)
      });

      setNuevoProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: ''
      });

      setMensaje('✅ Producto creado correctamente.');

      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo crear el producto.');
    }
  };

  const editarProducto = async (producto) => {
    const nombre = window.prompt(
      'Nombre del producto:',
      producto.nombre
    );

    if (nombre === null) return;

    const descripcion = window.prompt(
      'Descripción:',
      producto.descripcion || ''
    );

    if (descripcion === null) return;

    const precio = window.prompt(
      'Precio:',
      producto.precio
    );

    if (precio === null) return;

    const stock = window.prompt(
      'Stock:',
      producto.stock
    );

    if (stock === null) return;

    try {
      await productosApi.actualizar(producto.id, {
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock)
      });

      setMensaje(
        `✅ Producto #${producto.id} actualizado correctamente.`
      );

      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el producto.');
    }
  };

  const eliminarProducto = async (producto) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await productosApi.eliminar(producto.id);

      setMensaje(
        `✅ Producto "${producto.nombre}" eliminado.`
      );

      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el producto.');
    }
  };

  // =========================================================
  // USUARIOS
  // =========================================================

  const editarUsuario = async (usuario) => {
    const nombre = window.prompt(
      'Nombre:',
      usuario.nombre
    );

    if (nombre === null) return;

    const rol = window.prompt(
      'Rol: USER o ADMIN',
      usuario.rol
    );

    if (rol === null) return;

    try {
      await usuariosApi.actualizar(usuario.id, {
        nombre,
        rol: rol.toUpperCase()
      });

      setMensaje(
        `✅ Usuario #${usuario.id} actualizado.`
      );

      await cargarUsuarios();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el usuario.');
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (Number(usuario.id) === Number(usuarioActual?.id)) {
      alert(
        'No puedes eliminar el usuario con el que tienes la sesión iniciada.'
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar al usuario "${usuario.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await usuariosApi.eliminar(usuario.id);

      setMensaje(
        `✅ Usuario "${usuario.nombre}" eliminado.`
      );

      await cargarUsuarios();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  const nombreUsuarioPedido = (pedido) => {
    const encontrado = usuarios.find(
      (usuario) =>
        Number(usuario.id) === Number(pedido.usuario_id)
    );

    if (encontrado) {
      return encontrado.nombre;
    }

    if (
      Number(pedido.usuario_id) ===
      Number(usuarioActual?.id)
    ) {
      return usuarioActual.nombre;
    }

    return `Usuario ${pedido.usuario_id}`;
  };

  // =========================================================
  // LOGIN
  // =========================================================

  if (!usuarioActual) {
    return (
      <>
        <style>{css}</style>

        <div className="login-page">
          <form
            className="login-card"
            onSubmit={iniciarSesion}
          >
            <div className="login-logo">🐾</div>

            <h1>Huellitas E-Commerce</h1>

            <p>
              Inicia sesión para ingresar a la tienda.
            </p>

            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            <label>Correo electrónico</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Contraseña</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="btn-primary"
              type="submit"
              disabled={cargandoLogin}
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

  // =========================================================
  // INTERFAZ PRINCIPAL
  // =========================================================

  return (
    <>
      <style>{css}</style>

      <div className="app">
        <header className="header">
          <div>
            <h1>🐾 Tienda Huellitas</h1>

            <p>
              Hola, <strong>{usuarioActual.nombre}</strong>
              {' · '}
              <span className="role">
                {usuarioActual.rol}
              </span>
            </p>
          </div>

          <button
            className="btn-danger"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </header>

        <nav className="navbar">
          <button
            className={
              vista === 'tienda'
                ? 'nav-active'
                : ''
            }
            onClick={() => setVista('tienda')}
          >
            🛍️ Tienda
          </button>

          <button
            className={
              vista === 'pedidos'
                ? 'nav-active'
                : ''
            }
            onClick={() => setVista('pedidos')}
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
              setVista('inventario')
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
                setVista('usuarios')
              }
            >
              👥 Usuarios
            </button>
          )}

          <button onClick={actualizarTodo}>
            🔄 Actualizar
          </button>
        </nav>

        {mensaje && (
          <div className="alert success">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* TIENDA */}
        {/* ================================================= */}

        {vista === 'tienda' && (
          <main className="store-layout">
            <section>
              <div className="title-row">
                <div>
                  <h2>Catálogo de productos</h2>

                  <p>
                    Productos obtenidos directamente
                    desde PostgreSQL.
                  </p>
                </div>

                <div className="counter">
                  {productos.length} productos
                </div>
              </div>

              <div className="products-grid">
                {productos.map((producto) => {
                  const enCarrito =
                    cantidadEnCarrito(producto.id);

                  const disponible =
                    producto.stock - enCarrito;

                  return (
                    <article
                      className="product-card"
                      key={producto.id}
                    >
                      <img
                        src={
                          IMAGENES_PRODUCTOS[
                            producto.nombre
                          ] || IMAGEN_DEFAULT
                        }
                        alt={producto.nombre}
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
                })}
              </div>

              {productos.length === 0 && (
                <div className="empty">
                  No hay productos registrados.
                </div>
              )}
            </section>

            {/* CARRITO */}

            <aside className="cart-panel">
              <h2>🛒 Tu carrito</h2>

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

              {carrito.map((item) => (
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <div>
                    <strong>
                      {item.nombre}
                    </strong>

                    <small>
                      {item.cantidad} × $
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
              ))}

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
                  Total a pagar
                </span>

                <strong>
                  ${totalCarrito.toFixed(2)} MXN
                </strong>
              </div>

              <label>
                Método de pago
              </label>

              <select
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(
                    e.target.value
                  )
                }
              >
                <option value="SPEI">
                  Transferencia SPEI
                </option>

                <option value="TARJETA">
                  Tarjeta Crédito/Débito
                </option>

                <option value="EFECTIVO">
                  Pago en efectivo
                </option>
              </select>

              <button
                className="btn-primary full checkout"
                onClick={finalizarCompra}
                disabled={
                  carrito.length === 0
                }
              >
                Finalizar compra
              </button>

              <p className="server-message">
                El total y el stock son
                verificados nuevamente por el
                backend antes de guardar el
                pedido.
              </p>
            </aside>
          </main>
        )}

        {/* ================================================= */}
        {/* PEDIDOS */}
        {/* ================================================= */}

        {vista === 'pedidos' && (
          <main className="page-content">
            <div className="title-row">
              <div>
                <h2>
                  📦 Historial de pedidos
                </h2>

                <p>
                  {esAdmin
                    ? 'Como administrador puedes visualizar todos los pedidos.'
                    : 'Aquí puedes visualizar tus pedidos.'}
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={cargarPedidos}
              >
                Actualizar pedidos
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
                        {pedido.estado}
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
                          #
                          {pedido.usuario_id}
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
                        cancelarPedido(pedido)
                      }
                    >
                      ❌ Cancelar / eliminar pedido
                    </button>

                    <small className="restore-text">
                      Al eliminar el pedido,
                      las unidades regresan al
                      inventario.
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

        {/* ================================================= */}
        {/* INVENTARIO */}
        {/* ================================================= */}

        {vista === 'inventario' && (
          <main className="page-content">
            <div className="title-row">
              <div>
                <h2>
                  📊 Inventario y Stock
                </h2>

                <p>
                  Información actualizada desde
                  PostgreSQL.
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={cargarProductos}
              >
                Actualizar stock
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
                      (total, producto) =>
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
                          producto.stock <=
                            3 &&
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
                          producto.stock ===
                          0
                      ).length
                    }
                  </strong>
                </div>
              </div>
            </div>

            {/* CREAR PRODUCTO ADMIN */}

            {esAdmin && (
              <section className="create-product">
                <h3>
                  ➕ Agregar nuevo producto
                </h3>

                <p>
                  La imagen no se almacena en
                  PostgreSQL.
                </p>

                <form
                  onSubmit={crearProducto}
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
                    <th>Producto</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>

                    {esAdmin && (
                      <th>Acciones</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {productos.map(
                    (producto) => (
                      <tr key={producto.id}>
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
                          {producto.stock ===
                          0 ? (
                            <span className="badge red-badge">
                              AGOTADO
                            </span>
                          ) : producto.stock <=
                            3 ? (
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

        {/* ================================================= */}
        {/* USUARIOS */}
        {/* ================================================= */}

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
                  onClick={cargarUsuarios}
                >
                  Actualizar usuarios
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
                            u.rol ===
                            'ADMIN'
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
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Contraseña</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuarios.map(
                      (usuario) => (
                        <tr key={usuario.id}>
                          <td>
                            #{usuario.id}
                          </td>

                          <td>
                            <strong>
                              {
                                usuario.nombre
                              }
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
  background: #f7f8fc;
  color: #1e293b;
  font-family: Arial, Helvetica, sans-serif;
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

.login-page {
  min-height: 100vh;
  background:
    linear-gradient(135deg, #eef2ff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: white;
  border-radius: 22px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.login-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 35px;
  background: #e9efff;
}

.login-card h1 {
  text-align: center;
  color: #2459d8;
  margin: 5px 0;
}

.login-card p {
  text-align: center;
  color: #64748b;
}

input,
select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 12px 13px;
  background: white;
}

input:focus,
select:focus {
  outline: 2px solid #bfdbfe;
  border-color: #2563eb;
}

.app {
  min-height: 100vh;
}

.header {
  background: white;
  padding: 22px 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  border-bottom: 1px solid #e2e8f0;
}

.header h1 {
  margin: 0;
  color: #2459d8;
}

.header p {
  margin: 6px 0 0;
  color: #64748b;
}

.role {
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: bold;
}

.navbar {
  background: white;
  padding: 14px 38px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  border-bottom: 1px solid #e2e8f0;
}

.navbar button {
  padding: 10px 15px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 9px;
  color: #334155;
  font-weight: bold;
}

.navbar button:hover {
  background: #f1f5f9;
}

.navbar .nav-active {
  color: white;
  background: #2864e8;
  border-color: #2864e8;
}

.alert {
  margin: 18px 38px 0;
  padding: 14px 18px;
  border-radius: 10px;
  font-weight: 600;
}

.success {
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.store-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 30px;
  padding: 38px;
  align-items: start;
}

.page-content {
  padding: 38px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.title-row h2 {
  margin: 0;
}

.title-row p {
  margin: 7px 0 0;
  color: #64748b;
}

.counter {
  padding: 9px 14px;
  border-radius: 20px;
  background: #e9efff;
  color: #2459d8;
  font-weight: bold;
}

.products-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(235px, 1fr));
  gap: 22px;
}

.product-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 17px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  transition: 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}

.product-card img {
  display: block;
  width: 100%;
  height: 190px;
  object-fit: cover;
  background: #e2e8f0;
}

.product-info {
  padding: 18px;
}

.product-id {
  color: #94a3b8;
  font-size: 12px;
  font-weight: bold;
}

.product-info h3 {
  margin: 6px 0;
  min-height: 48px;
}

.description {
  color: #64748b;
  font-size: 14px;
  min-height: 38px;
}

.price {
  color: #16a34a;
  font-size: 25px;
  font-weight: 800;
  margin: 13px 0;
}

.stock {
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
}

.stock-ok {
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.stock-low {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.stock-zero {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.cart-stock {
  margin-top: 9px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 7px;
  font-size: 13px;
  color: #475569;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.product-actions button {
  flex: 1;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 9px;
  border-radius: 8px;
  font-weight: bold;
}

.product-actions button:hover:not(:disabled) {
  background: #e2e8f0;
}

.cart-panel {
  position: sticky;
  top: 15px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 17px;
  padding: 22px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.cart-panel h2 {
  margin-top: 0;
}

.empty-cart {
  text-align: center;
  color: #64748b;
  padding: 20px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.45;
}

.cart-item {
  padding: 13px 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.cart-item small {
  display: block;
  color: #64748b;
  margin-top: 4px;
}

.cart-item-right {
  flex-shrink: 0;
  text-align: right;
}

.mini {
  margin-top: 7px;
  margin-right: 4px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
}

.mini.red {
  color: #b91c1c;
  background: #fff1f2;
  border-color: #fecaca;
}

.total {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 19px;
  padding: 20px 0;
}

.cart-panel label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.checkout {
  margin-top: 15px;
}

.full {
  width: 100%;
}

.server-message {
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
  text-align: center;
  margin-top: 13px;
}

.btn-primary {
  background: #2864e8;
  color: white;
  border: 0;
  padding: 12px 18px;
  border-radius: 9px;
  font-weight: bold;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: bold;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: 0;
  padding: 11px 16px;
  border-radius: 9px;
  font-weight: bold;
}

.orders-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 21px;
  box-shadow: 0 5px 15px rgba(15, 23, 42, 0.05);
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.order-top h3 {
  margin: 6px 0;
}

.pedido-id {
  color: #64748b;
  font-size: 13px;
}

.status {
  height: fit-content;
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: bold;
  background: #e2e8f0;
}

.status.pagado {
  background: #dcfce7;
  color: #166534;
}

.status.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status.enviado {
  background: #dbeafe;
  color: #1e40af;
}

.status.entregado {
  background: #ede9fe;
  color: #5b21b6;
}

.status.cancelado {
  background: #fee2e2;
  color: #991b1b;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 18px 0;
}

.order-info div {
  background: #f8fafc;
  padding: 12px;
  border-radius: 9px;
}

.order-info span,
.order-info strong {
  display: block;
}

.order-info span {
  color: #64748b;
  font-size: 12px;
}

.order-info strong {
  margin-top: 4px;
}

.order-date {
  color: #64748b;
  font-size: 13px;
}

.order-state label {
  display: block;
  margin: 13px 0 7px;
  font-weight: bold;
  font-size: 13px;
}

.btn-cancel {
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b91c1c;
  font-weight: bold;
}

.restore-text {
  display: block;
  color: #94a3b8;
  margin-top: 8px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(190px, 1fr));
  gap: 17px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  background: #eef2ff;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.stat-card span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  font-size: 30px;
  color: #2459d8;
  margin-top: 3px;
}

.create-product {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 25px;
}

.create-product h3 {
  margin-top: 0;
}

.create-product p {
  color: #64748b;
}

.product-form {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
}

th {
  text-align: left;
  background: #f8fafc;
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

td {
  padding: 14px;
  border-bottom: 1px solid #edf2f7;
}

tr:hover td {
  background: #fafafa;
}

.stock-number {
  font-size: 18px;
  font-weight: bold;
}

.badge {
  display: inline-block;
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: bold;
}

.green-badge {
  background: #dcfce7;
  color: #166534;
}

.orange-badge {
  background: #ffedd5;
  color: #c2410c;
}

.red-badge {
  background: #fee2e2;
  color: #b91c1c;
}

.admin-badge {
  background: #e0e7ff;
  color: #3730a3;
}

.user-badge {
  background: #e2e8f0;
  color: #334155;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-edit,
.btn-delete {
  border: 0;
  padding: 7px 9px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: bold;
}

.btn-edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-delete {
  background: #fee2e2;
  color: #b91c1c;
}

.empty {
  background: white;
  border: 1px dashed #cbd5e1;
  border-radius: 13px;
  padding: 35px;
  text-align: center;
  color: #64748b;
}

.users-stats {
  max-width: 600px;
}

@media (max-width: 950px) {
  .store-layout {
    grid-template-columns: 1fr;
  }

  .cart-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .header,
  .navbar,
  .page-content,
  .store-layout {
    padding-left: 18px;
    padding-right: 18px;
  }

  .alert {
    margin-left: 18px;
    margin-right: 18px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
`;
