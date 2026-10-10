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

export const reportesApi = {
  dashboard: ({
    desde,
    hasta,
    periodo = 'dia',
    limite = 5
  } = {}) => {
    const params = new URLSearchParams();

    if (desde) {
      params.set('desde', desde);
    }

    if (hasta) {
      params.set('hasta', hasta);
    }

    if (periodo) {
      params.set('periodo', periodo);
    }

    params.set('limite', limite);

    return apiFetch(
      `/reportes?${params.toString()}`
    );
  },

  productos: ({
    desde,
    hasta,
    limite = 5
  } = {}) => {
    const params = new URLSearchParams();

    if (desde) {
      params.set('desde', desde);
    }

    if (hasta) {
      params.set('hasta', hasta);
    }

    params.set('limite', limite);

    return apiFetch(
      `/reportes/productos?${params.toString()}`
    );
  },

  ingresos: ({
    desde,
    hasta,
    periodo = 'dia'
  } = {}) => {
    const params = new URLSearchParams();

    if (desde) {
      params.set('desde', desde);
    }

    if (hasta) {
      params.set('hasta', hasta);
    }

    params.set('periodo', periodo);

    return apiFetch(
      `/reportes/ingresos?${params.toString()}`
    );
  },

  estados: ({
    desde,
    hasta
  } = {}) => {
    const params = new URLSearchParams();

    if (desde) {
      params.set('desde', desde);
    }

    if (hasta) {
      params.set('hasta', hasta);
    }

    return apiFetch(
      `/reportes/estados?${params.toString()}`
    );
  },

  ticketPromedio: ({
    desde,
    hasta
  } = {}) => {
    const params = new URLSearchParams();

    if (desde) {
      params.set('desde', desde);
    }

    if (hasta) {
      params.set('hasta', hasta);
    }

    return apiFetch(
      `/reportes/ticket-promedio?${params.toString()}`
    );
  }
};

