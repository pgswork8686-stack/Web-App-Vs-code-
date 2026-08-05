import { describe, it, expect } from 'vitest';
import { parseWebEnv, WebEnvironmentValidationError } from './env';

describe('Web Env Validation', () => {
  it('should parse valid web environment configuration', () => {
    const source = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://mpljxkaxkektcuvnosiq.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-long-enough-key',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    };
    const parsed = parseWebEnv(source);
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
  });

  it('should throw WebEnvironmentValidationError on missing keys', () => {
    const source = {
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    };
    try {
      parseWebEnv(source as any);
      throw new Error('Should have failed');
    } catch (err: any) {
      expect(err).toBeInstanceOf(WebEnvironmentValidationError);
      expect(err.message).toContain('NEXT_PUBLIC_SUPABASE_URL');
    }
  });
});
