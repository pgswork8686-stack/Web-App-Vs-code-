import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environmental variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const runMigration = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL environment variable is missing.');
  }

  console.log('Running migrations...');
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: path.resolve(__dirname, '../migrations') });
  console.log('Migrations applied successfully!');
  await sql.end();
};

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
