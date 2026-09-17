export class ClasificacionService {
  constructor(repository, videojuegos) { this.repository = repository; this.videojuegos = videojuegos; }
  async list(options) {
    if (options.ID_videojuego !== undefined) await this.videojuegos.get(options.ID_videojuego);
    return { data: await this.repository.list(options), pagination: { page: options.page, limit: options.limit } };
  }
}
