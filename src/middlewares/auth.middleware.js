import { DomainError } from '../domain/errors.js';
export function createAuth(authService) {
  return async (req, res, next) => {
    const raw = req.get('Authorization') ?? '';
    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(raw);
    if (!match || raw.length > 4096) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    const credentials = Buffer.from(match[1], 'base64').toString('utf8');
    const separator = credentials.indexOf(':');
    const correo = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    if (separator < 1 || [...correo].length > 150 || !password || password.length > 512) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    req.auth = await authService.authenticate(correo, password);
    next();
  };
}
