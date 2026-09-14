import { DomainError, notFound } from '../domain/errors.js';
import { ROLES } from '../domain/roles.js';
export class UsuariosRepository {
  constructor(database) { this.database = database; }
  async findForAuthentication(correo) {
    const [rows] = await this.database.execute(
      'SELECT u.ID AS id, u.Nombre AS nombre, u.Correo AS correo, u.Contrasena AS passwordHash, r.Nombre AS rol FROM usuarios u JOIN roles r ON r.ID = u.ID_Rol WHERE u.Correo = ? LIMIT 1', [correo]);
    return rows[0] ?? null;
  }
  createAdministrator(data) {
    return this.database.transaction(async c => {
      let result;
      try {
        [result] = await c.execute(
          'INSERT INTO usuarios (Nombre, Correo, Contrasena, ID_Rol) SELECT ?, ?, ?, ID FROM roles WHERE Nombre = ?',
          [data.nombre, data.correo, data.passwordHash, ROLES.ADMINISTRADOR]);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') throw new DomainError('CONFLICT', 'El correo del usuario ya está registrado.');
        throw error;
      }
      if (result.affectedRows !== 1) throw new Error('Catálogo de roles incompleto.');
      const [[row]] = await c.execute(
        'SELECT u.ID, u.Nombre, u.Correo, u.ID_Rol, r.Nombre AS Rol FROM usuarios u JOIN roles r ON r.ID = u.ID_Rol WHERE u.ID = ?', [result.insertId]);
      if (!row) notFound();
      return row;
    });
  }
}
