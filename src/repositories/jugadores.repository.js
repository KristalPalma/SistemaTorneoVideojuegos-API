import { notFound } from '../domain/errors.js';
const FIELDS = Object.freeze(["nombre", "gamertag", "correo"]);
export class JugadoresRepository {
  constructor(database, clock) { this.database = database; this.clock = clock; }
  
  async createIn(connection, input) {
    const [result] = await connection.execute('INSERT INTO jugadores (nombre, gamertag, correo, fecha_registro) VALUES (?, ?, ?, ?)', [input.nombre, input.gamertag, input.correo, this.clock()]);
    return this.get(result.insertId, connection);
  }
  create(input) { return this.database.transaction(c => this.createIn(c, input)); }
  
  async remove(id) {
    const [result] = await this.database.execute('DELETE FROM jugadores WHERE ID = ?', [id]);
    if (!result.affectedRows) notFound();
  }
}
