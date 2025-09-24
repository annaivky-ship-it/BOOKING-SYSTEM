import { FastifyRequest, FastifyReply } from 'fastify'
import { getSupabaseAnonClient } from '../lib/database'
import { logger } from '../lib/logger'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'admin' | 'performer' | 'client'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser
  }
}

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7)
    const supabase = getSupabaseAnonClient()

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User profile not found'
      })
    }

    request.user = {
      id: user.id,
      email: user.email!,
      role: profile.role
    }

    logger.debug({ userId: user.id, role: profile.role }, 'User authenticated')
  } catch (error) {
    logger.error({ error }, 'Authentication error')
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    })
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      })
    }
  }
}

export const requireAdmin = requireRole(['admin'])
export const requirePerformer = requireRole(['performer'])
export const requireClient = requireRole(['client'])
export const requireAdminOrPerformer = requireRole(['admin', 'performer'])
export const requireAdminOrClient = requireRole(['admin', 'client'])