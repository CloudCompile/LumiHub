import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { errorHandler, notFound } from './middleware/error.middleware.ts';
import charactersRoutes from './routes/characters.routes.ts';
import authRoutes from './routes/auth.routes.ts';
import userRoutes from './routes/user.routes.ts';
import { logger } from './utils/logger.ts';
import { env } from './env.ts';

const app = new Hono();

app.use('*', cors({
  origin: env.FRONTEND_URL,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
});

app.use('/uploads/*', serveStatic({ root: './uploads', rewriteRequestPath: (p) => p.replace(/^\/uploads/, '') }));

app.use('*', errorHandler);
app.route('/api/v1/characters', charactersRoutes);
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/user', userRoutes);
app.notFound(notFound);

export default app;
