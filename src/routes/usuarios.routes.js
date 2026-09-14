import { Router } from 'express';
import { createUsuariosController } from '../controllers/usuarios.controller.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { ROLES } from '../domain/roles.js';
export function createUsuariosRouter(service, authenticate) {
  const router = Router();
  const controller = createUsuariosController(service);
  router.post('/', authenticate, authorize(ROLES.SUPERADMINISTRADOR), controller.createAdministrator);
  return router;
}
