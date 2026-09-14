import { validarVideojuegos } from '../domain/videojuegos.js';
export class VideojuegosService {
  /** @param {import('../contracts/repositories.js').CrudRepository} repository */
  constructor(repository) { this.repository = repository;  }
  async list(options) {
    const data = await this.repository.list(options);
    return { data, pagination: { page: options.page, limit: options.limit } };
  }
  get(id) { return this.repository.get(id); }
  create(input) { return this.repository.create(validarVideojuegos(input)); }
  update(id, input) { return this.repository.update(id, validarVideojuegos(input, true)); }
  remove(id) { return this.repository.remove(id); }
}
