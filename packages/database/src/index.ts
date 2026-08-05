import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';
export * from 'drizzle-orm';

export type DatabaseInstance = PostgresJsDatabase<typeof schema>;

let queryClient: postgres.Sql | null = null;

export function getDb(connectionString: string): DatabaseInstance {
  if (!queryClient) {
    queryClient = postgres(connectionString);
  }
  return drizzle(queryClient, { schema });
}
