import { authorize } from '../middlewares/authorize.middleware.js';
import { ROLES } from '../domain/roles.js';
import { Router } from 'express';
import { createPuntuacionesController } from '../controllers/puntuaciones.controller.js';
export function createPuntuacionesRouter(service, authenticate) {
  const router = Router();
  const controller = createPuntuacionesController(service);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', authenticate, authorize(ROLES.ADMINISTRADOR), controller.create);
  router.patch('/:id', authenticate, authorize(ROLES.ADMINISTRADOR), controller.update);
  router.delete('/:id', authenticate, authorize(ROLES.ADMINISTRADOR), controller.remove);
  return router;
}
