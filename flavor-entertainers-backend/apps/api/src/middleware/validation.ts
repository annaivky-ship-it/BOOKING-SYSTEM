import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodSchema } from 'zod'
import { logger } from '../lib/logger'

export function validateBody<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.body)
      request.body = validated
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ error: error.issues, body: request.body }, 'Validation error')
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request body',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        })
      }

      logger.error({ error }, 'Unexpected validation error')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Validation failed'
      })
    }
  }
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.query)
      request.query = validated
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ error: error.issues, query: request.query }, 'Query validation error')
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        })
      }

      logger.error({ error }, 'Unexpected query validation error')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Query validation failed'
      })
    }
  }
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.params)
      request.params = validated
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ error: error.issues, params: request.params }, 'Params validation error')
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid path parameters',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        })
      }

      logger.error({ error }, 'Unexpected params validation error')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Parameter validation failed'
      })
    }
  }
}