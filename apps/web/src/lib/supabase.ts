import { createBrowserSupabaseClient } from '@pgs/auth';
import { env } from '../config/env';

export const supabase = createBrowserSupabaseClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
