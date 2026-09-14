import { DomainError } from '../domain/errors.js';
import { verifyPassword } from '../security/password.js';
export function createAuth(config) {
  return async (req, res, next) => {
    const raw = req.get('Authorization') ?? '';
    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(raw);
    if (!match || raw.length > 2048) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    const credentials = Buffer.from(match[1], 'base64').toString('utf8');
    const separator = credentials.indexOf(':');
    const user = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    if (separator < 1 || password.length > 512) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    const valid = await verifyPassword(password, config.passwordHash);
    if (!valid || user !== config.user) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    req.auth = Object.freeze({ usuario: user });
    next();
  };
}
