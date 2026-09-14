import { validate, text, integer } from './validation.js';
const schema = Object.freeze({ nombre: text(100), gamertag: text(50), correo: text(150, true) });
export const validarJugadores = (input, partial = false) => validate(input, schema, partial);
