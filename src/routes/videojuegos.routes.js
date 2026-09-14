import { authorize } from '../middlewares/authorize.middleware.js';
import { ROLES } from '../domain/roles.js';
import { Router } from 'express';
import { createVideojuegosController } from '../controllers/videojuegos.controller.js';
export function createVideojuegosRouter(service, authenticate) {
  const router = Router();
  const controller = createVideojuegosController(service);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', authenticate, authorize(ROLES.SUPERADMINISTRADOR), controller.create);
  router.patch('/:id', authenticate, authorize(ROLES.SUPERADMINISTRADOR), controller.update);
  router.delete('/:id', authenticate, authorize(ROLES.SUPERADMINISTRADOR), controller.remove);
  return router;
}
