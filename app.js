import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { createApiRouter } from './src/routes/index.js';
import { createAuth } from './src/middlewares/auth.middleware.js';
import { authorize } from './src/middlewares/authorize.middleware.js';
import { ROLES } from './src/domain/roles.js';
import { errorMiddleware, notFoundMiddleware } from './src/middlewares/error.middleware.js';
export function createApp({ config, services, ready = async () => {} }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => { req.requestId = randomUUID(); res.set('X-Request-Id', req.requestId); next(); });
  app.use(helmet());
  app.use(cors({ origin: [config.frontendOrigin], methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'], exposedHeaders: ['X-Request-Id', 'Idempotency-Replayed'] }));
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', rateLimit({ windowMs: 60000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Intenta más tarde.' } } }));
  const authenticate = createAuth(services.auth);
  app.use(express.json({ limit: '16kb', strict: true }));
  app.get('/api/health/ready', authenticate, authorize(ROLES.SUPERADMINISTRADOR), async (req, res) => { await ready(); res.json({ status: 'ready' }); });
  app.use('/api', createApiRouter(services, authenticate));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}
