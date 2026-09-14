export function createUsuariosController(service) {
  return {
    createAdministrator: async (req, res) => {
      const data = await service.createAdministrator(req.body, req.auth);
      res.status(201).json({ data });
    },
  };
}
