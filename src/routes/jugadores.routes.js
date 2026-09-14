import { Router } from 'express';
import { createJugadoresController } from '../controllers/jugadores.controller.js';
export function createJugadoresRouter(service) {
  const router = Router();
  const controller = createJugadoresController(service);
  router.post('/', controller.create);
  return router;
}
