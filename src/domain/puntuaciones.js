import { validate, text, integer } from './validation.js';
const schema = Object.freeze({ ID_jugador: integer(1), ID_videojuego: integer(1), puntuacion: integer(0) });
export const validarPuntuaciones = (input, partial = false) => validate(input, schema, partial);
