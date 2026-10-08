import { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess({ email, nombre: 'Usuario Huellitas' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '1.5rem' }}>🐾 Iniciar Sesión en Huellitas</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.8rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Ingresar a la Tienda
          </button>
        </form>
      </div>
    </div>
  );
}