import { useState } from 'react';
import LoginPage from './modules/auth/LoginPage';
import ProductsPage from './modules/products/ProductsPage';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <header className="header">
        <h2>🐾 Huellitas — Tienda de Mascotas</h2>
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Hola, <strong>{user.nombre}</strong> <span className="badge">{user.rol}</span></span>
              <button onClick={() => setUser(null)} style={{ background: '#ef4444', fontSize: '0.85rem' }}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Bienvenido</span>
          )}
        </div>
      </header>

      <main className="container">
        {!user ? (
          <LoginPage onLogin={(userData) => setUser(userData)} />
        ) : (
          <ProductsPage user={user} />
        )}
      </main>
    </div>
  );
}