export class EstadisticasService {
  constructor(repository, videojuegos) { this.repository = repository; this.videojuegos = videojuegos; }
  async get(options) {
    if (options.ID_videojuego !== undefined) await this.videojuegos.get(options.ID_videojuego);
    return this.repository.get(options.ID_videojuego);
  }
}
