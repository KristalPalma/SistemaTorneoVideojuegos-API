import { DomainError } from '../domain/errors.js';
export class AuthService {
  constructor(usuariosRepository, passwordVerifier, dummyHash) {
    this.usuariosRepository = usuariosRepository; this.passwordVerifier = passwordVerifier; this.dummyHash = dummyHash;
  }
  async authenticate(correo, password) {
    const user = await this.usuariosRepository.findForAuthentication(correo.trim().toLowerCase());
    const valid = await this.passwordVerifier(password, user?.passwordHash ?? this.dummyHash);
    if (!user || !valid) throw new DomainError('UNAUTHORIZED', 'Se requieren credenciales válidas.');
    return Object.freeze({ id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol });
  }
}
