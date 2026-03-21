import { z } from 'zod';

/** Validates required environment variables at startup. */
const envSchema = z.object({
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/lumihub'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  DATABASE_URL: parsed.data.DATABASE_URL,
  PORT: parseInt(parsed.data.PORT, 10),
  NODE_ENV: parsed.data.NODE_ENV,
};
