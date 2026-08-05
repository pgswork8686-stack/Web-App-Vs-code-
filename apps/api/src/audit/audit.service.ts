import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { auditLogs } from '@pgs/database';

@Injectable()
export class AuditService {
  constructor(private readonly dbService: DatabaseService) {}

  async log(params: {
    actorProfileId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    beforeData?: any;
    afterData?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) {
    try {
      await this.dbService.db.insert(auditLogs).values({
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
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }
}
