import mysql from 'mysql2/promise';
export class Database {
  constructor(options) { this.pool = mysql.createPool(options); }
  execute(sql, values = []) { return this.pool.execute(sql, values); }
  close() { return this.pool.end(); }
  async verify() {
    const [[version]] = await this.execute('SELECT VERSION() AS version');
    const [major, minor, patch] = version.version.split('.').map(Number);
    if (![8, 9].includes(major) || (major === 8 && minor === 0 && patch < 16)) throw new Error('Este proyecto requiere MySQL 8.0.16+ o 9 (funciones de ventana y CHECK).');
    const [tables] = await this.execute(
      "SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('jugadores','videojuegos','puntuaciones','api_solicitudes','usuarios','Rol')",
    );
    // if (tables.length !== 6 || tables.some(t => t.ENGINE !== 'InnoDB')) throw new Error('Faltan tablas o no usan InnoDB; revisa DB_NAME y las migraciones 001 y 003.');
    // await this.execute('SELECT ID, Nombre, Correo, Contrasena, ID_Rol FROM usuarios LIMIT 0');
    // const [roles] = await this.execute("SELECT Nombre FROM roles WHERE Nombre IN ('Superadministrador', 'Administrador')");
    // if (roles.length !== 2) throw new Error('Faltan los dos roles únicos del catálogo roles.');
    // await this.execute('SELECT ID, nombre, gamertag, correo, fecha_registro FROM jugadores LIMIT 0');
    // await this.execute('SELECT ID, nombre, genero FROM videojuegos LIMIT 0');
    // await this.execute('SELECT ID, ID_jugador, ID_videojuego, puntuacion, fecha FROM puntuaciones LIMIT 0');
    // await this.execute('SELECT usuario, operacion, clave, hash_solicitud, codigo_http, cuerpo_respuesta FROM api_solicitudes LIMIT 0');
  }
  async transaction(work) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      try { await connection.rollback(); } catch { /* Conservar el error inicial. */ }
      throw error;
    } finally { connection.release(); }
  }
}
