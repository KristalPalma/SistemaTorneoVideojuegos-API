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
