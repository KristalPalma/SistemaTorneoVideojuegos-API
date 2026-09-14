import { id, query, idempotencyKey } from '../validators/query.validator.js';
export function createJugadoresController(service) {
  return {
    list: async (req, res) => res.json(await service.list(query(req.query, ['buscar']))),
    get: async (req, res) => res.json({ data: await service.get(id(req.params.id)) }),
    create: async (req, res) => {
      res.status(201).json({ data: await service.create(req.body) });
    }
  };
}
