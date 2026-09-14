import { readFileSync } from 'node:fs';
export function loadConfig(env = process.env) {
  const required = name => {
    const value = env[name];
    if (typeof value !== 'string' || !value.trim() || value === 'REEMPLAZAR') throw new Error(`Configura ${name} en .env.`);
    return value;
  };
  const integer = (name, fallback, max = 65535) => {
    const raw = env[name] ?? String(fallback);
    if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > max) throw new Error(`Configuración inválida: ${name}.`);
    return Number(raw);
  };
  const frontendOrigin = env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const url = new URL(frontendOrigin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== frontendOrigin) throw new Error('FRONTEND_ORIGIN debe ser un origen HTTP(S) sin ruta.');
  const timeZone = env.APP_TIME_ZONE?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
  new Intl.DateTimeFormat('en', { timeZone }).format();
  if (!['true', 'false'].includes(env.DB_SSL ?? 'false')) throw new Error('DB_SSL debe ser true o false.');
  const ssl = env.DB_SSL === 'true' ? { rejectUnauthorized: true, ...(env.DB_SSL_CA_FILE ? { ca: readFileSync(env.DB_SSL_CA_FILE, 'utf8') } : {}) } : undefined;
  return {
    host: env.HOST || '127.0.0.1', port: integer('PORT', 3000), frontendOrigin, timeZone,
    database: {
      host: required('DB_HOST'), port: integer('DB_PORT', 3306), database: required('DB_NAME'),
      user: required('DB_USER'), password: required('DB_PASSWORD'), ssl,
      waitForConnections: true, connectionLimit: integer('DB_POOL_SIZE', 10, 100), queueLimit: 100,
      connectTimeout: 10000, dateStrings: true, charset: 'utf8mb4', multipleStatements: false,
    },
  };
}
