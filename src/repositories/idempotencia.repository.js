import { DomainError } from '../domain/errors.js';
export class IdempotenciaRepository {
  constructor(database) { this.database = database; }
  execute(context, hash, work) {
    return this.database.transaction(async c => {
      const key = [context.usuario, context.operacion, context.clave];
      let isNew = true;
      try {
        await c.execute('INSERT INTO api_solicitudes (usuario, operacion, clave, hash_solicitud) VALUES (?, ?, ?, ?)', [...key, hash]);
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
        isNew = false;
      }
      // INSERT waits for a concurrent transaction with the same unique key.
      // A locking read sees its committed result, even under REPEATABLE READ.
      const [[row]] = await c.execute('SELECT hash_solicitud, codigo_http, cuerpo_respuesta FROM api_solicitudes WHERE usuario = ? AND operacion = ? AND clave = ? FOR UPDATE', key);
      if (row.hash_solicitud !== hash) throw new DomainError('CONFLICT', 'Idempotency-Key ya se utilizó con otros datos.');
      if (!isNew) {
        if (row.codigo_http === null || row.cuerpo_respuesta === null) throw new Error('Registro idempotente incompleto.');
        return { status: row.codigo_http, body: typeof row.cuerpo_respuesta === 'string' ? JSON.parse(row.cuerpo_respuesta) : row.cuerpo_respuesta, replayed: true };
      }
      const body = { data: await work(c) };
      await c.execute('UPDATE api_solicitudes SET codigo_http = ?, cuerpo_respuesta = ? WHERE usuario = ? AND operacion = ? AND clave = ?', [201, JSON.stringify(body), ...key]);
      return { status: 201, body, replayed: false };
    });
  }
}
