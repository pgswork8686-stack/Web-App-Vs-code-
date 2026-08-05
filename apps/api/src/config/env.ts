import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env files in order of priority
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  DATABASE_URL: z.string().min(10),
  DIRECT_URL: z.string().min(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  parsed.error.issues.forEach((issue) => {
    console.error(`   - Variable: ${issue.path.join('.')}, Issue: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
