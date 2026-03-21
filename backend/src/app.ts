import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { errorHandler, notFound } from './middleware/error.middleware.ts';
import charactersRoutes from './routes/characters.routes.ts';
import { logger } from './utils/logger.ts';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
});

app.use('/uploads/*', serveStatic({ root: './' }));

app.use('*', errorHandler);
app.route('/api/v1/characters', charactersRoutes);
app.notFound(notFound);

export default app;
