import { defineConfig } from 'drizzle-kit';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load từ root workspace .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
// Fallback về .env.local cùng cấp
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // DIRECT_URL dùng session mode (port 5432) — phù hợp cho migration
    url: process.env.DIRECT_URL ||
         process.env.DATABASE_URL ||
         'postgresql://postgres:postgres@localhost:54322/postgres',
  },
});
