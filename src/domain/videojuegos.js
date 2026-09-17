import { validate, text, integer } from './validation.js';
const schema = Object.freeze({ nombre: text(100), ID_genero: integer(1) });
export const validarVideojuegos = (input, partial = false) => validate(input, schema, partial);
