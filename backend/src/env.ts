import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().default('mongodb://localhost:27017/lumihub'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  MONGODB_URI: parsed.data.MONGODB_URI,
  PORT: parseInt(parsed.data.PORT, 10),
  NODE_ENV: parsed.data.NODE_ENV,
};
