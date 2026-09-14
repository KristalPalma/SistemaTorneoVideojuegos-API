import { createHash } from 'node:crypto';
export class IdempotenciaService {
  constructor(repository) { this.repository = repository; }
  execute(context, data, work) {
    const canonical = JSON.stringify(Object.keys(data).sort().map(key => [key, data[key]]));
    const hash = createHash('sha256').update(canonical).digest('hex');
    return this.repository.execute(context, hash, work);
  }
}
