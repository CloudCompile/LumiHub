import type { MiddlewareHandler, Env } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifySessionToken, type SessionPayload } from '../services/auth.service.ts';

export type AuthEnv = Env & {
  Variables: {
    userId: string;
    session: SessionPayload;
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
    const payload = await verifySessionToken(token);
    c.set('userId', payload.id as string);
    c.set('session', payload);
  } catch {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 }, 401);
  }

  await next();
};
