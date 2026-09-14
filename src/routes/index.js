import { Router } from 'express';
import { createUsuariosRouter } from './usuarios.routes.js';
import { createJugadoresRouter } from './jugadores.routes.js';
import { createVideojuegosRouter } from './videojuegos.routes.js';
import { createPuntuacionesRouter } from './puntuaciones.routes.js';
import { query } from '../validators/query.validator.js';
export function createApiRouter(services, authenticate) {
  const router = Router();
  router.get('/auth/me', authenticate, (req, res) => res.json({ data: req.auth }));
  router.use('/jugadores', createJugadoresRouter(services.jugadores, authenticate));
  router.use('/videojuegos', createVideojuegosRouter(services.videojuegos, authenticate));
  router.use('/puntuaciones', createPuntuacionesRouter(services.puntuaciones, authenticate));
  router.get('/clasificacion', async (req, res) => res.json(await services.clasificacion.list(query(req.query, ['ID_videojuego']))));
  router.get('/estadisticas', async (req, res) => res.json({ data: await services.estadisticas.get(query(req.query, ['ID_videojuego'], false)) }));
  router.use('/usuarios', createUsuariosRouter(services.usuarios, authenticate));
  return router;
}
