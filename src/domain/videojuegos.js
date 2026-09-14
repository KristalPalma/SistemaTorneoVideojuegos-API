import { validate, text, integer } from './validation.js';
const schema = Object.freeze({ nombre: text(100), genero: text(50) });
export const validarVideojuegos = (input, partial = false) => validate(input, schema, partial);
