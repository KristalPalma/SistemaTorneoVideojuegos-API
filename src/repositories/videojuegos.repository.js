import { notFound } from '../domain/errors.js';
const SELECT = `SELECT v.ID, v.nombre, v.ID_genero, g.Nombre AS genero
  FROM videojuegos v JOIN generos g ON g.ID = v.ID_genero`;
const FIELDS = Object.freeze(['nombre', 'ID_genero']);
export class VideojuegosRepository {
  constructor(database) { this.database = database; }
  async list(options) {
    const [rows] = await this.database.execute(`${SELECT} ORDER BY v.ID DESC LIMIT ? OFFSET ?`, [options.limit, options.offset]);
    return rows;
  }
  async get(id, executor = this.database) {
    const [rows] = await executor.execute(`${SELECT} WHERE v.ID = ?`, [id]);
    if (!rows.length) notFound();
    return rows[0];
  }
  async createIn(connection, input) {
    const [result] = await connection.execute('INSERT INTO videojuegos (nombre, ID_genero) VALUES (?, ?)', [input.nombre, input.ID_genero]);
    return this.get(result.insertId, connection);
  }
  create(input) { return this.database.transaction(c => this.createIn(c, input)); }
  update(id, input) {
    return this.database.transaction(async c => {
      const [rows] = await c.execute('SELECT ID FROM videojuegos WHERE ID = ? FOR UPDATE', [id]);
      if (!rows.length) notFound();
      const fields = FIELDS.filter(f => Object.hasOwn(input, f));
      await c.execute(`UPDATE videojuegos SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE ID = ?`, [...fields.map(f => input[f]), id]);
      return this.get(id, c);
    });
  }
  async remove(id) {
    const [result] = await this.database.execute('DELETE FROM videojuegos WHERE ID = ?', [id]);
    if (!result.affectedRows) notFound();
  }
}
