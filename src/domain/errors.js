export class DomainError extends Error {
  constructor(code, message) { super(message); this.name = 'DomainError'; this.code = code; }
}
export function invalid(message) { throw new DomainError('VALIDATION_ERROR', message); }
export function notFound() { throw new DomainError('NOT_FOUND', 'Registro no encontrado.'); }
