import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer
  }
}