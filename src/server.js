import { createServer } from 'node:http';
import { once } from 'node:events';
import { loadConfig } from './config/env.js';
import { Database } from './database/database.js';
import { createContainer } from './container.js';
import { createApp } from '../app.js';

let database, server;
async function start() {
  const config = loadConfig();
  database = new Database(config.database);
  await database.verify();
  const services = createContainer(database, config);
  server = createServer(createApp({ config, services, ready: () => database.execute('SELECT 1') }));
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.listen(config.port, config.host);
  await once(server, 'listening');
  console.log(`Listening on: http://${config.host}:${config.port}/api`);
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 10000);
    timer.unref();
    try {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      await database.close();
    } catch { process.exitCode = 1; }
    finally { clearTimeout(timer); }
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
start().catch(async error => {
  const messages = {
    ER_BAD_DB_ERROR: 'DB_NAME no existe.', ER_NO_SUCH_TABLE: 'Falta una tabla; revisa DB_NAME y las migraciones.',
    ER_ACCESS_DENIED_ERROR: 'MySQL rechazó las credenciales.', ECONNREFUSED: 'Conexión MySQL rechazada.',
    ETIMEDOUT: 'Conexión MySQL agotó su tiempo.', EADDRINUSE: 'El puerto está ocupado.',
  };
  const reason = Object.hasOwn(messages, error?.code ?? '') ? messages[error.code] : (!error?.code ? error.message : `Error técnico: ${String(error.code).replace(/[^A-Z0-9_]/g, '')}`);
  console.error(`No fue posible iniciar la API. ${reason}`);
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  if (database) { try { await database.close(); } catch {} }
  process.exitCode = 1;
});
