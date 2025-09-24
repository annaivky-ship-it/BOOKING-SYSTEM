import Fastify from 'fastify'
import './types'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { config } from './config'
import { logger } from './lib/logger'

// Route imports
import { authRoutes } from './routes/auth'
import { bookingRoutes } from './routes/bookings'
import { paymentRoutes } from './routes/payments'
import { webhookRoutes } from './routes/webhooks'
// Note: Additional routes would be imported here

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer
  }
}

async function buildApp() {
  const fastify = Fastify({
    logger: logger,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    genReqId: () => crypto.randomUUID()
  })

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production'
  })

  await fastify.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true
  })

  await fastify.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW,
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded'
    })
  })

  // Raw body capture for webhooks
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      const json = JSON.parse(body.toString())
      req.rawBody = body as Buffer
      done(null, json)
    } catch (err) {
      done(err as Error, undefined)
    }
  })

  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: config.UPLOAD_MAX_SIZE,
      files: 5
    }
  })

  // Register Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Flavor Entertainers API',
        description: 'Production-ready backend for adult entertainment performer bookings in Western Australia',
        version: '1.0.0',
        contact: {
          name: 'Flavor Entertainers',
          email: 'contact@lustandlace.com.au'
        }
      },
      servers: [
        {
          url: config.BASE_URL,
          description: 'Production server'
        },
        {
          url: 'http://localhost:8080',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Bookings', description: 'Booking management endpoints' },
        { name: 'Performers', description: 'Performer management endpoints' },
        { name: 'Vetting', description: 'Client vetting endpoints' },
        { name: 'Payments', description: 'Payment processing endpoints' },
        { name: 'Admin', description: 'Administrative endpoints' },
        { name: 'Webhooks', description: 'Webhook endpoints' }
      ]
    }
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  })

  // Health check endpoint
  fastify.get('/healthz', {
    schema: {
      tags: ['Health'],
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
            environment: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.NODE_ENV
    }
  })

  // Register route modules
  await fastify.register(authRoutes, { prefix: '/auth' })
  await fastify.register(bookingRoutes, { prefix: '/bookings' })
  await fastify.register(paymentRoutes, { prefix: '/payments' })
  await fastify.register(webhookRoutes, { prefix: '/webhooks' })

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500

    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        params: request.params,
        query: request.query
      }
    }, 'Request error')

    if (statusCode >= 500) {
      reply.code(statusCode).send({
        error: 'Internal Server Error',
        message: config.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: request.id
      })
    } else {
      reply.code(statusCode).send({
        error: error.name || 'Error',
        message: error.message,
        requestId: request.id
      })
    }
  })

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      requestId: request.id
    })
  })

  return fastify
}

async function start() {
  try {
    const app = await buildApp()

    await app.listen({
      port: config.PORT,
      host: '0.0.0.0'
    })

    logger.info({
      port: config.PORT,
      environment: config.NODE_ENV,
      docs: `http://localhost:${config.PORT}/docs`
    }, 'Server started successfully')

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal')
      try {
        await app.close()
        logger.info('Server closed gracefully')
        process.exit(0)
      } catch (error) {
        logger.error({ error }, 'Error during shutdown')
        process.exit(1)
      }
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

  } catch (error) {
    logger.error({ error }, 'Failed to start server')
    process.exit(1)
  }
}

// Start server if this file is run directly
if (require.main === module) {
  start()
}

export { buildApp }