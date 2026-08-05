import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { auditLogs, DatabaseInstance } from '@pgs/database';

export interface AuditLogParams {
  actorProfileId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly dbService: DatabaseService) {}

  // Standard non-transactional log helper
  async log(params: AuditLogParams) {
    await this.logWithTransaction(this.dbService.db, params);
  }

  // Transactional log helper to support atomic operations
  async logWithTransaction(tx: DatabaseInstance, params: AuditLogParams) {
    await tx.insert(auditLogs).values({
      actor_profile_id: params.actorProfileId || null,
      action: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      before_data: params.beforeData || null,
      after_data: params.afterData || null,
      metadata: params.metadata || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      request_id: params.requestId || null,
    });
  }
}
