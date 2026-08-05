import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getDb } from '@pgs/database';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dbInstance: any;

  onModuleInit() {
    const connStr = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
    this.dbInstance = getDb(connStr);
  }

  onModuleDestroy() {
    // If postgres client has resources to clean up, handle it here
  }

  get db() {
    return this.dbInstance;
  }
}
