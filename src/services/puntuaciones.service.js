import { validarPuntuaciones } from '../domain/puntuaciones.js';
export class PuntuacionesService {
  /** @param {import('../contracts/repositories.js').CrudRepository} repository */
  constructor(repository, idempotency) { this.repository = repository; this.idempotency = idempotency; }
  async list(options) {
    const data = await this.repository.list(options);
    return { data, pagination: { page: options.page, limit: options.limit } };
  }
  get(id) { return this.repository.get(id); }
  create(input, context) { const data = validarPuntuaciones(input); return this.idempotency.execute(context, data, c => this.repository.createIn(c, data)); }
  update(id, input) { return this.repository.update(id, validarPuntuaciones(input, true)); }
  remove(id) { return this.repository.remove(id); }
}
