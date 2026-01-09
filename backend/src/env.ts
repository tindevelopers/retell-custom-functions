import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('8080'),
  SERVICE_NAME: z.string().default('retell-functions'),
  RETELL_API_KEY: z.string(),
  RETELL_API_BASE: z.string().default('https://api.retellai.com'),
  RETELL_SHARED_SECRET: z.string().optional(),
  GCS_BUCKET: z.string(),
  ADMIN_SHARED_SECRET: z.string(),
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

