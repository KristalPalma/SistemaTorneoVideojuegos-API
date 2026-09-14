import { notFound } from '../domain/errors.js';
const SELECT = 'SELECT ID, ID_jugador, ID_videojuego, puntuacion, fecha FROM puntuaciones';
const FIELDS = Object.freeze(["ID_jugador", "ID_videojuego", "puntuacion"]);
export class PuntuacionesRepository {
  constructor(database, clock) { this.database = database; this.clock = clock; }
  async list(options) {
    const conditions = [], values = [];
    for (const field of ['ID_jugador', 'ID_videojuego']) {
      if (options[field] !== undefined) { conditions.push(`${field} = ?`); values.push(options[field]); }
    }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await this.database.execute(`${SELECT}${where} ORDER BY ID DESC LIMIT ? OFFSET ?`, [...values, options.limit, options.offset]);
    return rows;
  }
  async get(id, executor = this.database) {
    const [rows] = await executor.execute(`${SELECT} WHERE ID = ?`, [id]);
    if (!rows.length) notFound();
    return rows[0];
  }
  async createIn(connection, input) {
    const [result] = await connection.execute('INSERT INTO puntuaciones (ID_jugador, ID_videojuego, puntuacion, fecha) VALUES (?, ?, ?, ?)', [input.ID_jugador, input.ID_videojuego, input.puntuacion, this.clock()]);
    return this.get(result.insertId, connection);
  }
  create(input) { return this.database.transaction(c => this.createIn(c, input)); }
  update(id, input) {
    return this.database.transaction(async c => {
      const [rows] = await c.execute('SELECT ID FROM puntuaciones WHERE ID = ? FOR UPDATE', [id]);
      if (!rows.length) notFound();
      const fields = FIELDS.filter(f => Object.hasOwn(input, f));
      await c.execute(`UPDATE puntuaciones SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE ID = ?`, [...fields.map(f => input[f]), id]);
      return this.get(id, c);
    });
  }
  async remove(id) {
    const [result] = await this.database.execute('DELETE FROM puntuaciones WHERE ID = ?', [id]);
    if (!result.affectedRows) notFound();
  }
}
