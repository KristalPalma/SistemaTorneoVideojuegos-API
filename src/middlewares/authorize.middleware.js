import { requireRole } from '../domain/roles.js';
export function authorize(...roles) {
  return (req, res, next) => { requireRole(req.auth, roles); next(); };
}
