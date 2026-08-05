import { createBrowserSupabaseClient } from '@pgs/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpljxkaxkektcuvnosiq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-key';

export const supabase = createBrowserSupabaseClient(supabaseUrl, supabaseAnonKey);
