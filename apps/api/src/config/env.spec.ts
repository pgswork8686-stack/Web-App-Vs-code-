import { describe, it, expect } from 'vitest';
import { parseApiEnv, EnvironmentValidationError } from './env';

describe('Api Env Validation', () => {
  it('should parse valid environment source', () => {
    const source = {
      NODE_ENV: 'development',
      API_PORT: '3001',
      WEB_ORIGIN: 'http://localhost:3000',
      SUPABASE_URL: 'https://mpljxkaxkektcuvnosiq.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key-long-enough-key',
      DATABASE_URL: 'postgresql://postgres:password@host:5432/db',
    };
    const parsed = parseApiEnv(source);
    expect(parsed.API_PORT).toBe(3001);
  });

  it('should throw EnvironmentValidationError on missing variable without exposing secrets', () => {
    const source = {
      NODE_ENV: 'development',
      API_PORT: '3001',
    };
    try {
      parseApiEnv(source as any);
      throw new Error('Should have failed');
    } catch (err: any) {
      expect(err).toBeInstanceOf(EnvironmentValidationError);
      expect(err.message).toContain('SUPABASE_URL');
      expect(err.message).not.toContain('postgresql://');
    }
  });
});
