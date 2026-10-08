const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Error HTTP ${response.status}`);
  }

  return data;
}

export const usuariosApi = {
  login: (body) => apiFetch('/login', { method: 'POST', body: JSON.stringify(body) }),
  listar: () => apiFetch('/usuarios'),
  obtener: (id) => apiFetch(`/usuarios/${id}`),
  crear: (body) => apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
};

export const productosApi = {
  listar: () => apiFetch('/productos'),
  obtener: (id) => apiFetch(`/productos/${id}`),
  crear: (body) => apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/productos/${id}`, { method: 'DELETE' })
};

export const pedidosApi = {
  listar: () => apiFetch('/pedidos'),
  obtener: (id) => apiFetch(`/pedidos/${id}`),
  crear: (body) => apiFetch('/pedidos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => apiFetch(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => apiFetch(`/pedidos/${id}`, { method: 'DELETE' })
};
