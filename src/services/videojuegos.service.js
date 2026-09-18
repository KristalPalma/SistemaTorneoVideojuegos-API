import { validarVideojuegos } from '../domain/videojuegos.js';
import { DomainError } from '../domain/errors.js';
export class VideojuegosService {
  /** @param {import('../contracts/repositories.js').CrudRepository} repository */
  constructor(repository, generos) { this.repository = repository; this.generos = generos; }
  async list(options) {
    const data = await this.repository.list(options);
    return { data, pagination: { page: options.page, limit: options.limit } };
  }
  get(id) { return this.repository.get(id); }
  async create(input) {
    const data = validarVideojuegos(input);
    await this.validateGenero(data.ID_genero);
    return this.repository.create(data);
  }
  async update(id, input) {
    const data = validarVideojuegos(input, true);
    if (data.ID_genero !== undefined) await this.validateGenero(data.ID_genero);
    return this.repository.update(id, data);
  }
  async validateGenero(id) {
    if (!await this.generos.exists(id)) throw new DomainError('INVALID_REFERENCE', 'El género indicado no existe.');
  }
  remove(id) { return this.repository.remove(id); }
}
