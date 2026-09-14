import { id, query, idempotencyKey } from '../validators/query.validator.js';
export function createPuntuacionesController(service) {
  return {
    list: async (req, res) => res.json(await service.list(query(req.query, ['ID_jugador', 'ID_videojuego']))),
    get: async (req, res) => res.json({ data: await service.get(id(req.params.id)) }),
    create: async (req, res) => {
      const result = await service.create(req.body, { usuario: `usuario:${req.auth.id}`, clave: idempotencyKey(req.get('Idempotency-Key')), operacion: 'POST:/api/puntuaciones' });
      res.set('Idempotency-Replayed', String(result.replayed)).status(result.status).json(result.body);
    },
    update: async (req, res) => res.json({ data: await service.update(id(req.params.id), req.body) }),
    remove: async (req, res) => { await service.remove(id(req.params.id)); res.status(204).end(); },
  };
}
