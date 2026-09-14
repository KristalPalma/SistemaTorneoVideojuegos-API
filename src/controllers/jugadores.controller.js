import { id, query, idempotencyKey } from '../validators/query.validator.js';
export function createJugadoresController(service) {
  return {
    create: async (req, res) => {
      res.status(201).json({ data: await service.create(req.body) });
    },
    update: async (req, res) => res.json({ data: await service.update(id(req.params.id), req.body) }),
    remove: async (req, res) => { await service.remove(id(req.params.id)); res.status(204).end(); },
  };
}
