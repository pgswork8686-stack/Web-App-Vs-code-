import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';
export * from 'drizzle-orm';

let queryClient: postgres.Sql | null = null;

export function getDb(connectionString: string) {
  if (!queryClient) {
    queryClient = postgres(connectionString);
  }
  return drizzle(queryClient, { schema });
}
