export class GenerosService {
  constructor(repository) { this.repository = repository; }
  async list(options) {
    return {
      data: await this.repository.list(options),
      pagination: { page: options.page, limit: options.limit },
    };
  }
}
