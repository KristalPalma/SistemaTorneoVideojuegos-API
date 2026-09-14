import { DomainError } from '../domain/errors.js';
const domainStatus = { VALIDATION_ERROR: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409 };
const databaseErrors = {
  ER_DUP_ENTRY: [409, 'DUPLICATE', 'El gamertag o nombre de videojuego ya existe.'],
  ER_NO_REFERENCED_ROW_2: [422, 'INVALID_REFERENCE', 'El jugador o videojuego indicado no existe.'],
  ER_ROW_IS_REFERENCED_2: [409, 'RELATED_RECORDS', 'No se puede eliminar: existen puntuaciones relacionadas.'],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, 'INVALID_SCORE', 'Los datos incumplen una restricción de la base de datos.'],
  ER_LOCK_DEADLOCK: [503, 'RETRY_LATER', 'Conflicto temporal. Reintenta la solicitud con la misma clave.'],
  ER_LOCK_WAIT_TIMEOUT: [503, 'RETRY_LATER', 'Conflicto temporal. Reintenta la solicitud con la misma clave.'],
};
export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = 500, code = 'INTERNAL_ERROR', message = 'Error interno del servidor.';
  if (error instanceof DomainError && Object.hasOwn(domainStatus, error.code)) {
    status = domainStatus[error.code]; code = error.code; message = error.message;
  } else if (Object.hasOwn(databaseErrors, error?.code ?? '')) {
    [status, code, message] = databaseErrors[error.code];
  } else if (error?.type === 'entity.parse.failed') {
    status = 400; code = 'INVALID_JSON'; message = 'El cuerpo debe ser JSON válido.';
  } else if (error?.type === 'entity.too.large') {
    status = 413; code = 'BODY_TOO_LARGE'; message = 'El cuerpo supera 16 KB.';
  }
  if (status === 401) res.set('WWW-Authenticate', 'Basic realm="Torneo", charset="UTF-8"');
  if (status === 503) res.set('Retry-After', '1');
  if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', code: String(error?.code || 'UNEXPECTED').replace(/[^A-Z0-9_]/g, '').slice(0, 64), requestId: req.requestId }));
  res.status(status).json({ error: { code, message }, requestId: req.requestId });
}
export function notFoundMiddleware(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' }, requestId: req.requestId });
}
