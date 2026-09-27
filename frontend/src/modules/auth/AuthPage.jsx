import { useState, useEffect } from 'react';

export default function AuthPage() {
  const [users, setUsers] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3001/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    setNombre(''); setEmail(''); setPassword('');
    cargarUsuarios();
  };

  return (
    <div>
      <h2>Módulo de Registro / Usuarios</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Registrar Usuario</button>
      </form>

      <h3>Usuarios Registrados</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}><strong>ID: {u.id}</strong> - {u.nombre} ({u.email}) - Rol: {u.rol}</li>
        ))}
      </ul>
    </div>
  );
}
