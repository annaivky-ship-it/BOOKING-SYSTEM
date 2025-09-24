import { FastifyInstance } from 'fastify'
import { AuthRegisterRequestSchema, AuthLoginRequestSchema, AuthMagicLinkRequestSchema } from '@flavor-entertainers/shared'
import { getSupabaseAnonClient } from '../lib/database'
import { validateBody } from '../middleware/validation'
import { auditService } from '../services/audit'
import { logger } from '../lib/logger'

export async function authRoutes(fastify: FastifyInstance) {
  // Register new user
  fastify.post('/register', {
    preHandler: [validateBody(AuthRegisterRequestSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Register a new user (client or performer)',
      body: AuthRegisterRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, role, display_name, phone } = request.body as any
    const supabase = getSupabaseAnonClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            display_name,
            phone
          }
        }
      })

      if (error) {
        logger.error({ error, email, role }, 'Registration failed')
        return reply.code(400).send({
          error: 'Registration Failed',
          message: error.message
        })
      }

      await auditService.log({
        event_type: 'user_registration',
        action: 'register',
        actor_email: email,
        ip: request.ip,
        request_id: request.id,
        details: { role, display_name }
      })

      logger.info({ userId: data.user?.id, email, role }, 'User registered successfully')

      return reply.code(201).send({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role
        }
      })
    } catch (error) {
      logger.error({ error, email, role }, 'Registration exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Registration failed'
      })
    }
  })

  // Login user
  fastify.post('/login', {
    preHandler: [validateBody(AuthLoginRequestSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Login with email and password',
      body: AuthLoginRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            token_type: { type: 'string' },
            expires_in: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as any
    const supabase = getSupabaseAnonClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        logger.warn({ error, email }, 'Login failed')
        return reply.code(401).send({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        })
      }

      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', data.user.id)
        .single()

      await auditService.log({
        event_type: 'user_login',
        action: 'login',
        actor_user_id: data.user.id,
        actor_email: email,
        ip: request.ip,
        request_id: request.id,
        details: { role: profile?.role }
      })

      logger.info({ userId: data.user.id, email, role: profile?.role }, 'User logged in')

      return reply.send({
        access_token: data.session.access_token,
        token_type: 'bearer',
        expires_in: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role,
          display_name: profile?.display_name
        }
      })
    } catch (error) {
      logger.error({ error, email }, 'Login exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Login failed'
      })
    }
  })

  // Send magic link
  fastify.post('/magic-link', {
    preHandler: [validateBody(AuthMagicLinkRequestSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Send magic link for passwordless login',
      body: AuthMagicLinkRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email } = request.body as any
    const supabase = getSupabaseAnonClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.BASE_URL}/auth/callback`
        }
      })

      if (error) {
        logger.error({ error, email }, 'Magic link failed')
        return reply.code(400).send({
          error: 'Magic Link Failed',
          message: error.message
        })
      }

      await auditService.log({
        event_type: 'magic_link_sent',
        action: 'send_magic_link',
        actor_email: email,
        ip: request.ip,
        request_id: request.id
      })

      logger.info({ email }, 'Magic link sent')

      return reply.send({
        message: 'Magic link sent. Please check your email.'
      })
    } catch (error) {
      logger.error({ error, email }, 'Magic link exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to send magic link'
      })
    }
  })

  // Refresh token
  fastify.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      description: 'Refresh access token',
      body: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { refresh_token } = request.body as any
    const supabase = getSupabaseAnonClient()

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      })

      if (error) {
        return reply.code(401).send({
          error: 'Refresh Failed',
          message: error.message
        })
      }

      return reply.send({
        access_token: data.session?.access_token,
        token_type: 'bearer',
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token
      })
    } catch (error) {
      logger.error({ error }, 'Token refresh exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Token refresh failed'
      })
    }
  })
}