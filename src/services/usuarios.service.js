import { ROLES, requireRole } from '../domain/roles.js';
import { validarNuevoUsuario } from '../domain/usuarios.js';
export class UsuariosService {
  constructor(repository, passwordHasher) { this.repository = repository; this.passwordHasher = passwordHasher; }
  async createAdministrator(input, actor) {
    requireRole(actor, [ROLES.SUPERADMINISTRADOR]);
    const { nombre, correo, contrasena } = validarNuevoUsuario(input);
    const passwordHash = await this.passwordHasher(contrasena);
    return this.repository.createAdministrator({ nombre, correo, passwordHash });
  }
}
