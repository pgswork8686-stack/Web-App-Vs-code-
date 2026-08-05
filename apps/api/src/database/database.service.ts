import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getDb, DatabaseInstance } from '@pgs/database';
import { env } from '../config/env';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dbInstance!: DatabaseInstance;

  onModuleInit() {
    this.dbInstance = getDb(env.DATABASE_URL);
  }

  onModuleDestroy() {
    // If postgres client has resources to clean up, handle it here
  }

  get db(): DatabaseInstance {
    return this.dbInstance;
  }
}
