import { validate, text } from './validation.js';
import { invalid } from './errors.js';
const password = value => {
  if (typeof value !== 'string' || value.length < 15 || value.length > 512 || /[\u0000-\u001f\u007f]/u.test(value)) invalid('contrasena debe tener entre 15 y 512 caracteres, sin caracteres de control.');
  return value;
};
const schema = Object.freeze({ nombre: text(100), correo: text(150, true), contrasena: password });
export function validarNuevoUsuario(input) {
  const data = validate(input, schema);
  data.correo = data.correo.toLowerCase();
  return data;
}
