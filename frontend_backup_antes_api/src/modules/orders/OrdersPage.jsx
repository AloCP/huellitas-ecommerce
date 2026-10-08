import { useState, useEffect } from 'react';
import { pedidosApi } from '../../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');

  const cargarPedidos = async () => {
    try {
      const data = await pedidosApi.listar();
      setOrders(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    }
  };

  useEffect(() => { cargarPedidos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        usuario_id: Number(usuarioId), 
        producto_id: Number(productoId), 
        cantidad: Number(cantidad) 
      })
    });

    if (res.ok) {
      setUsuarioId(''); setProductoId(''); setCantidad('');
      cargarPedidos();
    } else {
      const err = await res.json();
      alert('Error al procesar el pedido: ' + err.error);
    }
  };

  return (
    <div>
      <h2>Módulo de Gestión de Pedidos</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="number" placeholder="ID del Usuario" value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required />
        <input type="number" placeholder="ID del Producto" value={productoId} onChange={e => setProductoId(e.target.value)} required />
        <input type="number" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} required />
        <button type="submit">Generar Pedido</button>
      </form>

      <h3>Historial de Pedidos Realizados</h3>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            <strong>Pedido #{o.id}</strong> | Usuario ID: {o.usuario_id} | Estado: {o.estado} | Total: ${Number(o.total).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
