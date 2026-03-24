import type { Context, Next } from 'hono';
import { logger } from '../utils/logger.ts';
import { env } from '../env.ts';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    logger.error('Request error:', error);

    const statusCode = error.statusCode || error.status || 500;
    const message = env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : (error.message || 'Internal server error');

    return c.json(
      {
        error: statusCode >= 500 ? 'Internal Server Error' : (error.name || 'Error'),
        message,
        statusCode,
      },
      statusCode
    );
  }
}

export function notFound(c: Context) {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource was not found',
      statusCode: 404,
    },
    404
  );
}
