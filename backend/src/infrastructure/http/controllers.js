function manejarError(res, error) {
  console.error(error);
  const message = error.message || 'Error interno del servidor';

  if (message.includes('no encontrado') || message.includes('no encontrada')) {
    return res.status(404).json({ error: message });
  }

  if (
    message.includes('registrado') ||
    message.includes('obligatorio') ||
    message.includes('válido') ||
    message.includes('contraseña') ||
    message.includes('Stock') ||
    message.includes('cantidad') ||
    message.includes('precio')
  ) {
    return res.status(400).json({ error: message });
  }

  if (message.includes('Credenciales')) {
    return res.status(401).json({ error: message });
  }

  if (error.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (error.code === '23503') {
    return res.status(409).json({
      error: 'No se puede eliminar porque el registro está relacionado con otros datos'
    });
  }

  return res.status(500).json({ error: message });
}

export function crearControladores({ usuarioUseCase, productoUseCase, pedidoUseCase }) {
  const usuarios = {
    crear: async (req, res) => {
      try {
        res.status(201).json(await usuarioUseCase.crear(req.body));
      } catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await usuarioUseCase.listar()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await usuarioUseCase.obtener(req.params.id);
        if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await usuarioUseCase.actualizar(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await usuarioUseCase.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado correctamente' });
      } catch (e) { manejarError(res, e); }
    },
    login: async (req, res) => {
      try { res.json(await usuarioUseCase.login(req.body)); }
      catch (e) { manejarError(res, e); }
    }
  };

  const productos = {
    crear: async (req, res) => {
      try { res.status(201).json(await productoUseCase.crear(req.body)); }
      catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await productoUseCase.listar()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await productoUseCase.obtener(req.params.id);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await productoUseCase.actualizar(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await productoUseCase.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
      } catch (e) { manejarError(res, e); }
    }
  };

  const pedidos = {
    crear: async (req, res) => {
      try { res.status(201).json(await pedidoUseCase.crearPedido(req.body)); }
      catch (e) { manejarError(res, e); }
    },
    listar: async (_req, res) => {
      try { res.json(await pedidoUseCase.listarPedidos()); }
      catch (e) { manejarError(res, e); }
    },
    obtener: async (req, res) => {
      try {
        const data = await pedidoUseCase.obtenerPedido(req.params.id);
        if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    actualizar: async (req, res) => {
      try {
        const data = await pedidoUseCase.actualizarPedido(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(data);
      } catch (e) { manejarError(res, e); }
    },
    eliminar: async (req, res) => {
      try {
        const ok = await pedidoUseCase.eliminarPedido(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json({ message: 'Pedido eliminado y stock restaurado' });
      } catch (e) { manejarError(res, e); }
    }
  };

  return { usuarios, productos, pedidos };
}
