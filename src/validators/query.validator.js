import { invalid } from '../domain/errors.js';
import { INT_MAX } from '../domain/validation.js';
export function id(value, field = 'id') {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || Number(value) > INT_MAX) invalid(`${field} debe ser un entero positivo válido.`);
  return Number(value);
}
export function query(input, fields = [], paginate = true) {
  const allowed = [...fields, ...(paginate ? ['page', 'limit'] : [])];
  if (Object.keys(input).some(key => !allowed.includes(key))) invalid('Parámetros de consulta no permitidos.');
  const result = {};
  if (paginate) {
    result.page = input.page === undefined ? 1 : id(input.page, 'page');
    result.limit = input.limit === undefined ? 20 : id(input.limit, 'limit');
    if (result.page > 10000 || result.limit > 100) invalid('Máximo: page=10000 y limit=100.');
    result.offset = (result.page - 1) * result.limit;
  }
  for (const field of fields) {
    if (input[field] === undefined) continue;
    if (field === 'buscar') {
      if (typeof input[field] !== 'string' || [...input[field]].length > 100) invalid('buscar debe ser texto de hasta 100 caracteres.');
      result.buscar = input[field].trim();
    } else result[field] = id(input[field], field);
  }
  return result;
}
export function idempotencyKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(value)) invalid('Idempotency-Key es obligatorio y debe contener entre 16 y 128 caracteres alfanuméricos, guiones o guiones bajos.');
  return value;
}
