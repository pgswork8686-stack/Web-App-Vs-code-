import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export type WebEnv = z.infer<typeof envSchema>;

export class WebEnvironmentValidationError extends Error {
  constructor(public invalidVars: string[]) {
    super(`Web environment validation failed: ${invalidVars.join(', ')}`);
    this.name = 'WebEnvironmentValidationError';
  }
}

export function parseWebEnv(source: Record<string, string | undefined>): WebEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const invalidVars = parsed.error.issues.map((issue) => issue.path.join('.'));
    throw new WebEnvironmentValidationError(invalidVars);
  }
  return parsed.data;
}

let parsedEnv: WebEnv;
try {
  parsedEnv = parseWebEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
} catch (err: unknown) {
  if (err instanceof WebEnvironmentValidationError) {
    console.error('❌ Web Environment validation failed:');
    err.invalidVars.forEach((v) => console.error(`   - ${v}`));
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
  // Fallback to avoid build/compile crash in tests or environment initialization
  parsedEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  };
}

export const env = parsedEnv;
