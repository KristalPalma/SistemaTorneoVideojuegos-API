import { Router } from 'express';
import { createJugadoresController } from '../controllers/jugadores.controller.js';
export function createJugadoresRouter(service) {
  const router = Router();
  const controller = createJugadoresController(service);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
