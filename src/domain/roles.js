import { DomainError } from './errors.js';
export const ROLES = Object.freeze({ SUPERADMINISTRADOR: 'SUPER ADMINISTRADOR', ADMINISTRADOR: 'ADMINISTRADOR' });
export function requireRole(actor, allowed) {
  if (!actor) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
  if (!allowed.includes(actor.rol)) throw new DomainError('FORBIDDEN', 'No tienes permisos para realizar esta operación.');
}
