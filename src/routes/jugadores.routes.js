import { authorize } from '../middlewares/authorize.middleware.js';
import { ROLES } from '../domain/roles.js';
import { Router } from 'express';
import { createJugadoresController } from '../controllers/jugadores.controller.js';
export function createJugadoresRouter(service, authenticate) {
  const router = Router();
  const controller = createJugadoresController(service);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', authenticate, authorize(ROLES.ADMINISTRADOR), controller.create);
  router.patch('/:id', authenticate, authorize(ROLES.ADMINISTRADOR), controller.update);
  router.delete('/:id', authenticate, authorize(ROLES.ADMINISTRADOR), controller.remove);
  return router;
}
