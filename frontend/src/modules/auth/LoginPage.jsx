import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor backend');
    }
  };

  return (
    <div className="card login-card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#0f172a' }}>
        🐾 Iniciar Sesión en Huellitas
      </h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} className="form-group">
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ padding: '0.9rem' }}>Ingresar a la Tienda</button>
      </form>
    </div>
  );
}