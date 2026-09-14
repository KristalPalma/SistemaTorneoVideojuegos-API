import { notFound } from '../domain/errors.js';
const FIELDS = Object.freeze(["nombre", "gamertag", "correo"]);
export class JugadoresRepository {
  constructor(database, clock) { this.database = database; this.clock = clock; }
  async list(options) {
    const conditions = [], values = [];
    if (options.buscar) {
      conditions.push("(nombre LIKE ? ESCAPE '!' OR gamertag LIKE ? ESCAPE '!')");
      const pattern = `%${options.buscar.replace(/[!%_]/g, char => `!${char}`)}%`;
      values.push(pattern, pattern);
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
    const [result] = await connection.execute('INSERT INTO jugadores (nombre, gamertag, correo, fecha_registro) VALUES (?, ?, ?, ?)', [input.nombre, input.gamertag, input.correo, this.clock()]);
    return this.get(result.insertId, connection);
  }
  create(input) { return this.database.transaction(c => this.createIn(c, input)); }
  update(id, input) {
    return this.database.transaction(async c => {
      const [rows] = await c.execute('SELECT ID FROM jugadores WHERE ID = ? FOR UPDATE', [id]);
      if (!rows.length) notFound();
      const fields = FIELDS.filter(f => Object.hasOwn(input, f));
      await c.execute(`UPDATE jugadores SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE ID = ?`, [...fields.map(f => input[f]), id]);
      return this.get(id, c);
    });
  }
  async remove(id) {
    const [result] = await this.database.execute('DELETE FROM jugadores WHERE ID = ?', [id]);
    if (!result.affectedRows) notFound();
  }
}
