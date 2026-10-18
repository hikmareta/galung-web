import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_ENV: z.enum(['local', 'test', 'staging', 'production']),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().refine(value => value.startsWith('postgresql://'), 'PostgreSQL URL required'),
  REDIS_URL: z.string().url().refine(value => value.startsWith('redis://') || value.startsWith('rediss://'), 'Redis URL required'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});
export type AppConfig = z.infer<typeof schema>;
export function parseConfig(input: NodeJS.ProcessEnv): AppConfig {
  const config = schema.parse(input);
  if (config.APP_ENV !== 'local' && config.APP_ENV !== 'test') {
    const values = [config.DATABASE_URL, config.REDIS_URL, config.NEXT_PUBLIC_API_BASE_URL];
    if (values.some(value => /localhost|127\.0\.0\.1|example\.invalid|REPLACE_WITH/i.test(value))) {
      throw new Error('Non-local environment cannot use local or placeholder service URLs');
    }
    if (config.APP_ENV === 'production' && config.NODE_ENV !== 'production') throw new Error('Production requires NODE_ENV=production');
  }
  return config;
}
