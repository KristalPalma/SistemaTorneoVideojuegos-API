export class EstadisticasRepository {
  constructor(database) { this.database = database; }
  async get(videojuegoId) {
    const sql = videojuegoId === undefined
      ? `SELECT (SELECT COUNT(*) FROM jugadores) AS totalJugadores,
          (SELECT COUNT(*) FROM videojuegos) AS totalVideojuegos,
          COUNT(*) AS totalPuntuaciones, AVG(puntuacion) AS puntuacionPromedio FROM puntuaciones`
      : `SELECT COUNT(DISTINCT ID_jugador) AS totalJugadores,
          (SELECT COUNT(*) FROM videojuegos WHERE ID = ?) AS totalVideojuegos,
          COUNT(*) AS totalPuntuaciones, AVG(puntuacion) AS puntuacionPromedio
          FROM puntuaciones WHERE ID_videojuego = ?`;
    const [[row]] = await this.database.execute(sql, videojuegoId === undefined ? [] : [videojuegoId, videojuegoId]);
    return { totalJugadores: Number(row.totalJugadores), totalVideojuegos: Number(row.totalVideojuegos), totalPuntuaciones: Number(row.totalPuntuaciones), puntuacionPromedio: row.puntuacionPromedio === null ? null : Number(row.puntuacionPromedio) };
  }
}
