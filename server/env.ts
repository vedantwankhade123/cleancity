import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  // Allow missing DATABASE_URL in development; database-backed features will be disabled
  DATABASE_URL: z.string().url().optional(),
  // Optional in this app; sessions use SESSION_SECRET with a default elsewhere
  JWT_SECRET: z.string().min(32).optional(),
  // Optional: comma-separated list of allowed front-end origins for CORS (e.g., https://your-site.netlify.app)
  FRONTEND_ORIGIN: z.string().optional(),
  // Open-Meteo API is used which doesn't require an API key
});

export const env = envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
