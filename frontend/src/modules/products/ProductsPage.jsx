import { useState } from 'react';

const INITIAL_PRODUCTS = [
  { id: 1, nombre: 'Alimento Croquetas Perro Adulto 15kg', precio: 850.00, imagen_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500' },
  { id: 2, nombre: 'Suéter Calientito para Perro', precio: 249.90, imagen_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500' },
  { id: 3, nombre: 'Peine Cepillo Deslanador de Acero', precio: 179.50, imagen_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500' },
  { id: 4, nombre: 'Shampoo e Higiene para Mascotas 500ml', precio: 135.00, imagen_url: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500' }
];

export default function ProductsPage({ user }) {
  const [products] = useState(INITIAL_PRODUCTS);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  const handleBuyProduct = async (product) => {
    setLoadingId(product.id);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ ...product, cantidad: 1 }],
          total: product.precio,
          userEmail: user?.email || 'admin@gmail.com'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`¡Compra exitosa de "${product.nombre}"! Revisa la terminal del backend para ver el enlace del correo.`);
      } else {
        setMessage(`Error: ${data.error || 'No se pudo procesar la orden'}`);
      }
    } catch (err) {
      setMessage('Error de conexión con el backend local.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' }}>Catálogo de Productos 🐾</h2>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: 'bold',
          background: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Error') ? '#dc2626' : '#16a34a',
          border: `1px solid ${message.includes('Error') ? '#fca5a5' : '#86efac'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {products.map(prod => (
          <div key={prod.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: '#fff' }}>
            <img src={prod.imagen_url} alt={prod.nombre} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }} />
            <h4 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1rem', color: '#1e293b' }}>{prod.nombre}</h4>
            <p style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1.1rem', margin: '0.5rem 0' }}>${prod.precio.toFixed(2)}</p>
            <button 
              onClick={() => handleBuyProduct(prod)}
              disabled={loadingId === prod.id}
              style={{
                width: '100%',
                background: loadingId === prod.id ? '#9ca3af' : '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '0.6rem',
                borderRadius: '6px',
                cursor: loadingId === prod.id ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loadingId === prod.id ? 'Procesando...' : '🛒 Comprar Ahora'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}