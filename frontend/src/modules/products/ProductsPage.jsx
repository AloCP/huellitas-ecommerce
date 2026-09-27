import { useState } from 'react';

export default function ProductsPage({ user }) {
  // 15 Productos con imágenes exactas para cada artículo
  const [products, setProducts] = useState([
    { id: 1, nombre: 'Alimento Croquetas Perro Adulto 15kg', precio: 850.00, imagen_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 2, nombre: 'Suéter Calientito para Perro', precio: 249.90, imagen_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 3, nombre: 'Peine Cepillo Deslanador de Acero', precio: 179.50, imagen_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 4, nombre: 'Shampoo e Higiene para Mascotas 500ml', precio: 135.00, imagen_url: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 5, nombre: 'Cama Acolchada Cómoda para Perros', precio: 1200.00, imagen_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 6, nombre: 'Rascador Multinivel para Gato', precio: 950.00, imagen_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 7, nombre: 'Juguete Pelota Cuerda Resistente', precio: 89.00, imagen_url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 8, nombre: 'Plato Alimentador Acero Inoxidable', precio: 199.00, imagen_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 9, nombre: 'Correa y Collar para Paseo', precio: 280.00, imagen_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 10, nombre: 'Gato Doméstico en Arena Higiénica', precio: 320.00, imagen_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 11, nombre: 'Mochila Transportadora para Mascota', precio: 750.00, imagen_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 12, nombre: 'Snacks Premios Sabrosos 250g', precio: 110.00, imagen_url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 13, nombre: 'Arnés Pechera Ajustable', precio: 340.00, imagen_url: 'https://images.unsplash.com/photo-1534361960057-19889db98d18?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 14, nombre: 'Tazón de Agua Automatizado', precio: 620.00, imagen_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80', vendedor: 'Huellitas Oficial' },
    { id: 15, nombre: 'Cuidado y Cortauñas Ergonómico', precio: 145.00, imagen_url: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&q=80', vendedor: 'Huellitas Oficial' }
  ]);

  // Historial de Pedidos
  const [pedidos, setPedidos] = useState([
    { id: 101, cliente: 'Juan Pérez', producto: 'Alimento Croquetas Perro Adulto 15kg', total: 850.00, estado: 'PENDIENTE' },
    { id: 102, cliente: 'María López', producto: 'Cama Acolchada Cómoda para Perros', total: 1200.00, estado: 'APROBADO' },
    { id: 103, cliente: 'Carlos Gómez', producto: 'Rascador Multinivel para Gato', total: 950.00, estado: 'RECHAZADO' }
  ]);

  const [pestañaActiva, setPestañaActiva] = useState('catalogo');

  // Formulario Postulación
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const handlePostularProducto = (e) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const nuevoProducto = {
      id: Date.now(),
      nombre,
      precio: parseFloat(precio),
      imagen_url: imagenUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
      vendedor: user ? user.nombre : 'Usuario Postulante'
    };

    setProducts([nuevoProducto, ...products]);
    setNombre('');
    setPrecio('');
    setImagenUrl('');
    alert('¡Producto postulado con éxito en el catálogo de Huellitas!');
    setPestañaActiva('catalogo');
  };

  const handleCambiarEstadoPedido = (id, nuevoEstado) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  return (
    <div>
      {/* NAVEGACIÓN POR PESTAÑAS */}
      <div className="nav-tabs">
        <button 
          className={pestañaActiva === 'catalogo' ? 'active' : ''} 
          onClick={() => setPestañaActiva('catalogo')}
        >
          🛒 Catálogo ({products.length})
        </button>
        <button 
          className={pestañaActiva === 'postular' ? 'active' : ''} 
          onClick={() => setPestañaActiva('postular')}
        >
          ➕ Postular Producto
        </button>
        <button 
          className={pestañaActiva === 'pedidos' ? 'active' : ''} 
          onClick={() => setPestañaActiva('pedidos')}
        >
          📦 Módulo de Pedidos
        </button>
      </div>

      {/* APARTADO 1: CATÁLOGO */}
      {pestañaActiva === 'catalogo' && (
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#0f172a' }}>Catálogo Huellitas</h3>
          <div className="grid-products">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <img 
                  src={p.imagen_url} 
                  alt={p.nombre} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Sin+Imagen'; }}
                />
                <h4 style={{ fontSize: '0.95rem', height: '2.4rem', color: '#334155' }}>{p.nombre}</h4>
                <p className="price-tag">${Number(p.precio).toFixed(2)}</p>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.8rem' }}>
                  Publicado por: {p.vendedor}
                </div>
                <button 
                  onClick={() => alert(`Consulta del producto: ${p.nombre}`)}
                  style={{ width: '100%', backgroundColor: '#0284c7' }}
                >
                  Consultar Producto
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APARTADO 2: POSTULAR PRODUCTO */}
      {pestañaActiva === 'postular' && (
        <div className="card" style={{ maxWidth: '550px', margin: '0 auto' }}>
          <h3>📢 Postular un Producto</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Completa la información para proponer tu producto en el catálogo.
          </p>

          <form onSubmit={handlePostularProducto} className="form-group">
            <input 
              placeholder="Nombre del Producto" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              step="0.01" 
              placeholder="Precio ($)" 
              value={precio} 
              onChange={e => setPrecio(e.target.value)} 
              required 
            />
            <input 
              placeholder="URL de la imagen (ej. https://link.com/foto.jpg)" 
              value={imagenUrl} 
              onChange={e => setImagenUrl(e.target.value)} 
            />
            <button type="submit" style={{ backgroundColor: '#059669', marginTop: '0.5rem' }}>
              Postular en Huellitas
            </button>
          </form>
        </div>
      )}

      {/* APARTADO 3: PEDIDOS */}
      {pestañaActiva === 'pedidos' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📦 Módulo de Pedidos y Ventas</h3>
          
          {user && user.rol === 'ADMIN' ? (
            <p style={{ color: '#059669', fontWeight: 'bold', marginBottom: '1rem' }}>
              🛡️ Modo Administrador: Puedes Aprobar o Rechazar las ventas pendientes.
            </p>
          ) : (
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Modo Consulta: Estado de las ventas en el sistema.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pedidos.map(p => (
              <div 
                key={p.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1'
                }}
              >
                <div>
                  <strong>Pedido #{p.id}</strong> — {p.producto}
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Cliente: {p.cliente} | Total: <strong>${p.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge" style={{
                    backgroundColor: p.estado === 'APROBADO' ? '#dcfce7' : p.estado === 'RECHAZADO' ? '#fee2e2' : '#fef3c7',
                    color: p.estado === 'APROBADO' ? '#15803d' : p.estado === 'RECHAZADO' ? '#b91c1c' : '#b45309'
                  }}>
                    {p.estado}
                  </span>

                  {user && user.rol === 'ADMIN' && p.estado === 'PENDIENTE' && (
                    <>
                      <button 
                        onClick={() => handleCambiarEstadoPedido(p.id, 'APROBADO')}
                        style={{ backgroundColor: '#16a34a', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Aprobar Venta
                      </button>
                      <button 
                        onClick={() => handleCambiarEstadoPedido(p.id, 'RECHAZADO')}
                        style={{ backgroundColor: '#dc2626', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Rechazar Venta
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}