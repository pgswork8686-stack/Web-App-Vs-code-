import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { notifications, notificationRecipients, notificationPreferences } from '@pgs/database';
import { eq, and, sql } from '@pgs/database';

@Injectable()
export class NotificationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async findAllForProfile(profileId: string) {
    return this.dbService.db
      .select({
        id: notifications.id,
        event_type: notifications.event_type,
        title: notifications.title,
        body: notifications.body,
        priority: notifications.priority,
        action_url: notifications.action_url,
        created_at: notifications.created_at,
        read_at: notificationRecipients.read_at,
        handled_at: notificationRecipients.handled_at,
        archived_at: notificationRecipients.archived_at,
      })
      .from(notificationRecipients)
      .innerJoin(notifications, eq(notificationRecipients.notification_id, notifications.id))
      .where(eq(notificationRecipients.profile_id, profileId))
      .orderBy(sql`${notifications.created_at} desc`);
  }

  async getUnreadCount(profileId: string) {
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(notificationRecipients)
      .where(
        and(
          eq(notificationRecipients.profile_id, profileId),
          sql`${notificationRecipients.read_at} is null`
        )
      );
    return result[0]?.count || 0;
  }

  async markAsRead(id: string, profileId: string) {
    const [recipient] = await this.dbService.db
      .update(notificationRecipients)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(notificationRecipients.id, id),
          eq(notificationRecipients.profile_id, profileId)
        )
      )
      .returning();

    if (!recipient) {
      throw new NotFoundException('Không tìm thấy thông báo hoặc bạn không có quyền');
    }
    return recipient;
  }

  async markAsHandled(id: string, profileId: string) {
    const [recipient] = await this.dbService.db
      .update(notificationRecipients)
      .set({ handled_at: new Date() })
      .where(
        and(
          eq(notificationRecipients.id, id),
          eq(notificationRecipients.profile_id, profileId)
        )
      )
      .returning();

    if (!recipient) {
      throw new NotFoundException('Không tìm thấy thông báo hoặc bạn không có quyền');
    }
    return recipient;
  }

  async markAsArchived(id: string, profileId: string) {
    const [recipient] = await this.dbService.db
      .update(notificationRecipients)
      .set({ archived_at: new Date() })
      .where(
        and(
          eq(notificationRecipients.id, id),
          eq(notificationRecipients.profile_id, profileId)
        )
      )
      .returning();

    if (!recipient) {
      throw new NotFoundException('Không tìm thấy thông báo hoặc bạn không có quyền');
    }
    return recipient;
  }

  async markAllAsRead(profileId: string) {
    return this.dbService.db
      .update(notificationRecipients)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(notificationRecipients.profile_id, profileId),
          sql`${notificationRecipients.read_at} is null`
        )
      )
      .returning();
  }

  async getPreferences(profileId: string) {
    return this.dbService.db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.profile_id, profileId));
  }

  async updatePreferences(profileId: string, prefs: Array<{ event_type: string; channel: string; enabled: boolean }>) {
    const results = [];
    for (const pref of prefs) {
      const [updated] = await this.dbService.db
        .insert(notificationPreferences)
        .values({
          profile_id: profileId,
          event_type: pref.event_type,
          channel: pref.channel,
          enabled: pref.enabled,
        })
        .onConflictDoUpdate({
          target: [
            notificationPreferences.profile_id,
            notificationPreferences.event_type,
            notificationPreferences.channel,
          ],
          set: { enabled: pref.enabled, updated_at: new Date() },
        })
        .returning();
      results.push(updated);
    }
    return results;
  }
}
