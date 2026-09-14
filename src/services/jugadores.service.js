import { validarJugadores } from '../domain/jugadores.js';
export class JugadoresService {
  /** @param {import('../contracts/repositories.js').CrudRepository} repository */
  constructor(repository) { this.repository = repository;  }
  async list(options) {
    const data = await this.repository.list(options);
    return { data, pagination: { page: options.page, limit: options.limit } };
  }
  get(id) { return this.repository.get(id); }
  create(input) { return this.repository.create(validarJugadores(input)); }
  update(id, input) { return this.repository.update(id, validarJugadores(input, true)); }
  remove(id) { return this.repository.remove(id); }
}
