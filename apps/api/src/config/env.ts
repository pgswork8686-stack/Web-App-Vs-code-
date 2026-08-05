import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env files
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  DATABASE_URL: z.string().min(10),
});

export type ApiEnv = z.infer<typeof envSchema>;

export class EnvironmentValidationError extends Error {
  constructor(public missingOrInvalidVars: string[]) {
    super(`Cấu hình môi trường thiếu hoặc không hợp lệ: ${missingOrInvalidVars.join(', ')}`);
    this.name = 'EnvironmentValidationError';
  }
}

export function parseApiEnv(source: Record<string, string | undefined>): ApiEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const invalidVars = parsed.error.issues.map((issue) => issue.path.join('.'));
    throw new EnvironmentValidationError(invalidVars);
  }
  return parsed.data;
}

let parsedEnv: ApiEnv;
try {
  parsedEnv = parseApiEnv(process.env as Record<string, string | undefined>);
} catch (err: any) {
  if (err instanceof EnvironmentValidationError) {
    console.error('❌ Environment validation failed:');
    err.missingOrInvalidVars.forEach((v) => console.error(`   - ${v}`));
    // Only exit if not running in test mode
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
  // Fallback to avoid compile error during test execution
  parsedEnv = {
    NODE_ENV: 'test',
    API_PORT: 3001,
    WEB_ORIGIN: 'http://localhost:3000',
    SUPABASE_URL: 'https://placeholder.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-key-long-enough',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
  };
}

export const env = parsedEnv;
