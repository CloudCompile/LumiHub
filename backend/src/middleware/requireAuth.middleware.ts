import type { MiddlewareHandler, Env } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { env } from '../env.ts';

export type AuthEnv = Env & {
  Variables: {
    userId: string;
  };
};

/**
 * Requires a valid JWT session cookie.
 * Returns 401 if missing or invalid — does NOT fall through as guest.
 */
export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getCookie(c, 'lumihub_session');

  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'Authentication required', statusCode: 401 }, 401);
  }

  try {
    const payload = await verify(token, env.JWT_SECRET, 'HS256');
    c.set('userId', payload.id as string);
  } catch {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 }, 401);
  }

  await next();
};
