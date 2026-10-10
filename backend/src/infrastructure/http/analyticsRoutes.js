import { Router } from 'express';

import {
  crearAnalyticsController
} from './analyticsController.js';

export function crearAnalyticsRouter(analyticsService) {
  const router = Router();

  const controller =
    crearAnalyticsController(analyticsService);

  router.get(
    '/reportes',
    controller.dashboard
  );

  router.get(
    '/reportes/productos',
    controller.productos
  );

  router.get(
    '/reportes/ingresos',
    controller.ingresos
  );

  router.get(
    '/reportes/estados',
    controller.estados
  );

  router.get(
    '/reportes/ticket-promedio',
    controller.ticketPromedio
  );

  return router;
}
