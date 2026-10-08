import React, { useEffect, useState } from 'react';
import { usuariosApi, productosApi, pedidosApi } from './services/api';

// 1. Catálogo con imágenes de muestra
const PRODUCTOS_DEMO = [
  { id: 1, nombre: 'Alimento Premium Perro (3kg)', precio: 450.00, imagen: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80' },
  { id: 2, nombre: 'Juguete Interactivo Mordedera', precio: 120.00, imagen: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80' },
  { id: 3, nombre: 'Cama Ortopédica Grande', precio: 850.00, imagen: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80' },
  { id: 4, nombre: 'Correa Retráctil 5m', precio: 250.00, imagen: 'https://images.unsplash.com/photo-1603525281898-0be7dc8a474c?w=400&q=80' },
  { id: 5, nombre: 'Shampoo Avena Antipulgas', precio: 180.00, imagen: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80' }
];

export default function App() {
  // Estados de la aplicación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailCliente, setEmailCliente] = useState('');
  const [password, setPassword] = useState('');
  
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('SPEI');

  // Lógica de Login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const usuario = await usuariosApi.login({
        email: emailCliente,
        password
      });

      setUsuarioActual(usuario);
      setEmailCliente(usuario.email);
      setIsLoggedIn(true);
    } catch (error) {
      alert(error.message || 'Correo o contraseña incorrectos');
    }
  };

  const cargarProductos = async () => {
    try {
      const productos = await productosApi.listar();

      setProductosCatalog(
        productos.map(producto => ({
          ...producto,
          precio: Number(producto.precio),
          imagen:
            producto.imagen_url ||
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'
        }))
      );
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductosCatalog(PRODUCTOS_DEMO);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      cargarProductos();
    }
  }, [isLoggedIn]);

  // Lógica del Carrito (Agregar 1 o 2)
  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito(prevCarrito => {
      const productoExistente = prevCarrito.find(item => item.id === producto.id);
      if (productoExistente) {
        return prevCarrito.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad }];
    });
  };

  const calcularTotal = () => carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // Procesar compra hacia el Backend
  const procesarCheckout = async () => {
    if (carrito.length === 0) {
      return alert('El carrito está vacío');
    }

    if (!usuarioActual?.id) {
      return alert('Debes iniciar sesión antes de comprar');
    }

    const pedidoPayload = {
      usuario_id: usuarioActual.id,
      items: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const pedido = await pedidosApi.crear(pedidoPayload);

      alert(
        `¡Pedido #${pedido.id} realizado con éxito! Total: $${Number(
          pedido.total
        ).toFixed(2)} MXN`
      );

      setCarrito([]);
      await cargarProductos();
    } catch (error) {
      console.error('Error al procesar la orden', error);
      alert(error.message || 'Hubo un error al procesar el pedido.');
    }
  };

  // ------------------------------------------------------------------
  // VISTA 1: PANTALLA DE LOGIN
  // ------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={{color: '#2563eb'}}>Huellitas E-Commerce 🐾</h2>
          <p>Inicia sesión para acceder a la tienda</p>
          <form onSubmit={handleLogin} style={styles.form}>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              required 
              value={emailCliente} 
              onChange={e => setEmailCliente(e.target.value)} 
              style={styles.input} 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={styles.input} 
            />
            <button type="submit" style={styles.btnPrimary}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VISTA 2: CATÁLOGO Y CARRITO
  // ------------------------------------------------------------------
  return (
    <div style={styles.storeContainer}>
      <header style={styles.header}>
        <h1 style={{margin: 0, color: '#2563eb'}}>🐾 Tienda Huellitas</h1>
        <div>
          <span>Hola, <strong>{emailCliente}</strong></span>
          <button onClick={() => setIsLoggedIn(false)} style={styles.btnLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Lado izquierdo: Cuadrícula de Productos */}
        <section style={styles.catalogSection}>
          <div style={styles.grid}>
            {productosCatalog.map(prod => (
              <div key={prod.id} style={styles.productCard}>
                <img src={prod.imagen} alt={prod.nombre} style={styles.productImage} />
                <div style={styles.productInfo}>
                  <h3 style={styles.productTitle}>{prod.nombre}</h3>
                  <p style={styles.productPrice}>${prod.precio.toFixed(2)}</p>
                  <div style={styles.btnGroup}>
                    <button onClick={() => agregarAlCarrito(prod, 1)} style={styles.btnSecondary}>Agregar 1</button>
                    <button onClick={() => agregarAlCarrito(prod, 2)} style={styles.btnSecondary}>Agregar 2</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lado derecho: Barra lateral del Carrito */}
        <aside style={styles.cartSection}>
          <h2>🛒 Tu Carrito</h2>
          
          {carrito.length === 0 ? (
            <p style={{color: 'gray'}}>No has agregado productos.</p>
          ) : (
            <ul style={styles.cartList}>
              {carrito.map(item => (
                <li key={item.id} style={styles.cartItem}>
                  <div>
                    <strong style={{display: 'block'}}>{item.nombre}</strong>
                    <span style={{fontSize: '0.9em', color: 'gray'}}>Cant: {item.cantidad} x ${item.precio}</span>
                  </div>
                  <strong>${(item.precio * item.cantidad).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          )}
          
          <div style={styles.cartTotal}>
            <h3 style={{color: '#16a34a', margin: '0'}}>Total a pagar:</h3>
            <h2 style={{margin: '5px 0'}}>${calcularTotal().toFixed(2)} MXN</h2>
          </div>

          <hr style={{border: '0.5px solid #eee', margin: '20px 0'}} />

          <div style={styles.checkoutSection}>
            <label style={styles.label}>Método de Pago:</label>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={styles.select}>
              <option value="SPEI">Transferencia (SPEI)</option>
              <option value="TARJETA">Tarjeta Crédito/Débito</option>
              <option value="EFECTIVO">Pago en OXXO</option>
            </select>
            <button onClick={procesarCheckout} style={styles.btnCheckout}>Finalizar Compra</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------
// ESTILOS VISUALES (CSS en JS)
// ------------------------------------------------------------------
const styles = {
  // Pantalla de Login
  loginContainer: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0', fontFamily: 'system-ui, sans-serif' },
  loginCard: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '350px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' },
  btnPrimary: { padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  
  // Tienda Principal
  storeContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: 'white', borderBottom: '1px solid #e2e8f0' },
  btnLogout: { padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '15px', fontWeight: 'bold' },
  
  // Layout (Catálogo y Carrito)
  main: { display: 'flex', gap: '30px', padding: '30px 40px', alignItems: 'flex-start' },
  catalogSection: { flex: '1' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' },
  
  // Tarjetas de Producto
  productCard: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' },
  productImage: { width: '100%', height: '200px', objectFit: 'cover' },
  productInfo: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' },
  productTitle: { margin: 0, fontSize: '16px', color: '#1e293b' },
  productPrice: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#16a34a' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' },
  btnSecondary: { flex: 1, padding: '10px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  
  // Sidebar del Carrito
  cartSection: { width: '320px', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', position: 'sticky', top: '20px' },
  cartList: { listStyle: 'none', padding: 0, margin: '20px 0', maxHeight: '350px', overflowY: 'auto' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f1f5f9' },
  cartTotal: { textAlign: 'right', marginTop: '20px' },
  checkoutSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontWeight: 'bold', color: '#475569', fontSize: '14px' },
  select: { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#f8fafc' },
  btnCheckout: { padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }
};