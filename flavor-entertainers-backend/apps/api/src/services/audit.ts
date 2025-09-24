import { getSupabaseClient } from '../lib/database'
import { logger } from '../lib/logger'
import { AUDIT_EVENTS } from '@flavor-entertainers/shared'

export interface AuditLogEntry {
  event_type: string
  action: string
  actor_user_id?: string
  actor_email?: string
  request_id?: string
  ip?: string
  details?: Record<string, any>
  booking_id?: string
  application_id?: string
  client_email?: string
  performer_id?: string
}

export class AuditService {
  private supabase = getSupabaseClient()

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('audit_log')
        .insert({
          timestamp: new Date().toISOString(),
          ...entry
        })

      if (error) {
        logger.error({ error, entry }, 'Failed to write audit log')
      } else {
        logger.debug({ entry }, 'Audit log written')
      }
    } catch (error) {
      logger.error({ error, entry }, 'Exception writing audit log')
    }
  }

  async getAuditLogs(filters: {
    actor_email?: string
    event_type?: string
    action?: string
    date_from?: string
    date_to?: string
    limit?: number
    offset?: number
  }) {
    let query = this.supabase
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false })

    if (filters.actor_email) {
      query = query.eq('actor_email', filters.actor_email)
    }

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type)
    }

    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0
    }
  }
}

export const auditService = new AuditService()