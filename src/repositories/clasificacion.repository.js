export class ClasificacionRepository {
  constructor(database) { this.database = database; }
  async list(options) {
    const [rows] = await this.database.execute(`
      WITH candidatos AS (
        SELECT p.*, ROW_NUMBER() OVER (
          PARTITION BY ID_jugador
          ORDER BY puntuacion DESC, fecha IS NULL ASC, fecha ASC, ID ASC
        ) AS seleccion
        FROM puntuaciones p WHERE ID_videojuego = ?
      ), posiciones AS (
        SELECT ROW_NUMBER() OVER (
          ORDER BY c.puntuacion DESC, c.fecha IS NULL ASC, c.fecha ASC, c.ID ASC
        ) AS posicion, c.ID AS ID_puntuacion, c.ID_jugador,
        j.gamertag AS jugador, c.ID_videojuego, v.nombre AS videojuego,
        c.puntuacion, c.fecha
        FROM candidatos c
        JOIN jugadores j ON j.ID = c.ID_jugador
        JOIN videojuegos v ON v.ID = c.ID_videojuego
        WHERE c.seleccion = 1
      )
      SELECT * FROM posiciones ORDER BY posicion LIMIT ? OFFSET ?`,
    [options.ID_videojuego, options.limit, options.offset]);
    return rows;
  }
}
