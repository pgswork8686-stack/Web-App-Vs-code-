import { getDb } from './index';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

async function verify() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const db = getDb(dbUrl);
  console.log('Querying table constraints on "profiles" table...');
  const result = await db.execute(sql`
    SELECT conname, pg_get_constraintdef(c.oid) 
    FROM pg_constraint c 
    JOIN pg_namespace n ON n.oid = c.connamespace 
    WHERE conrelid = 'public.profiles'::regclass;
  `);

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
