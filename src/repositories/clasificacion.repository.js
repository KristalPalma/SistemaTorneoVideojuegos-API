export class ClasificacionRepository {
  constructor(database) { this.database = database; }

  async list(options) {
    const filtered = options.ID_videojuego !== undefined;
    const where = filtered ? 'WHERE ID_videojuego = ?' : '';
    const values = filtered ? [options.ID_videojuego] : [];
    const groupBy = filtered ? 'ID_videojuego, ID_jugador' : 'ID_videojuego';
    const partitionBy = filtered ? 'PARTITION BY c.ID_videojuego' : '';
    const orderBy = filtered ? 'posicion ASC' : 'ID_videojuego ASC, posicion ASC';
    
    const [rows] = await this.database.execute(`
      WITH candidatos AS (
        SELECT p.*, ROW_NUMBER() OVER (
          PARTITION BY ${groupBy}
          ORDER BY puntuacion DESC, fecha ASC, ID ASC
        ) AS seleccion
        FROM puntuaciones p ${where}
      ), posiciones AS (
        SELECT ROW_NUMBER() OVER (
          ${partitionBy}
          ORDER BY c.puntuacion DESC, c.fecha IS NULL ASC, c.fecha ASC, c.ID ASC
        ) AS posicion, c.ID AS ID_puntuacion, c.ID_jugador,
        j.gamertag AS jugador, c.ID_videojuego, v.nombre AS videojuego,
        c.puntuacion, c.fecha
        FROM candidatos c
        JOIN jugadores j ON j.ID = c.ID_jugador
        JOIN videojuegos v ON v.ID = c.ID_videojuego
        WHERE c.seleccion = 1
      )
      SELECT * FROM posiciones 
      ORDER BY ${orderBy} 
      LIMIT ? OFFSET ?`,
    [...values, options.limit, options.offset]);

    return rows;
  }
}
