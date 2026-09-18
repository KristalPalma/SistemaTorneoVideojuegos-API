import { invalid } from './errors.js';
export const INT_MAX = 2147483647;
const EMAIL_PATTERN = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/u;
export function text(max, email = false) {
  return (value, field) => {
    if (typeof value !== 'string') invalid(`${field} debe ser texto.`);
    const result = value.trim();
    if (!result || [...result].length > max || /[\u0000-\u001f\u007f]/u.test(result)) invalid(`${field}: longitud o caracteres inválidos.`);
    if (email && (!EMAIL_PATTERN.test(result) || result.indexOf('@') > 64)) invalid('correo debe tener un formato válido.');
    return result;
  };
}
export function integer(min) {
  return (value, field) => {
    if (!Number.isInteger(value) || value < min || value > INT_MAX) invalid(`${field} debe ser un entero entre ${min} y ${INT_MAX}.`);
    return value;
  };
}
export function validate(input, schema, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('Se requiere un objeto JSON.');
  const keys = Object.keys(input);
  if (keys.some(key => !Object.hasOwn(schema, key))) invalid('Existen campos no permitidos.');
  if (partial && keys.length === 0) invalid('Envía al menos un campo.');
  const output = {};
  for (const [key, validator] of Object.entries(schema)) {
    if (!Object.hasOwn(input, key)) { if (!partial) invalid(`${key} es obligatorio.`); continue; }
    output[key] = validator(input[key], key);
  }
  return output;
}
