import { defineConfig } from 'drizzle-kit';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load từ root workspace .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
// Fallback về .env.local cùng cấp
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('Drizzle configuration error: Both DIRECT_URL and DATABASE_URL are missing from environment variables.');
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
