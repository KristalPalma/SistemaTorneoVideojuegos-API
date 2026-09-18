export class GenerosRepository {
  constructor(database) { this.database = database; }
  async list(options) {
    const [rows] = await this.database.execute(
      'SELECT ID, Nombre FROM generos ORDER BY Nombre ASC, ID ASC LIMIT ? OFFSET ?',
      [options.limit, options.offset]);
    return rows;
  }
  async exists(id) {
    const [rows] = await this.database.execute('SELECT ID FROM generos WHERE ID = ? LIMIT 1', [id]);
    return rows.length > 0;
  }
}
