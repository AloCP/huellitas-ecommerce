import { Router } from 'express';

export function crearRouter(controladores) {
  const router = Router();
  const { usuarios, productos, pedidos } = controladores;

  router.post('/login', usuarios.login);

  router.post('/usuarios', usuarios.crear);
  router.get('/usuarios', usuarios.listar);
  router.get('/usuarios/:id', usuarios.obtener);
  router.put('/usuarios/:id', usuarios.actualizar);
  router.delete('/usuarios/:id', usuarios.eliminar);

  router.post('/productos', productos.crear);
  router.get('/productos', productos.listar);
  router.get('/productos/:id', productos.obtener);
  router.put('/productos/:id', productos.actualizar);
  router.delete('/productos/:id', productos.eliminar);

  router.post('/pedidos', pedidos.crear);
  router.get('/pedidos', pedidos.listar);
  router.get('/pedidos/:id', pedidos.obtener);
  router.put('/pedidos/:id', pedidos.actualizar);
  router.delete('/pedidos/:id', pedidos.eliminar);

  return router;
}
