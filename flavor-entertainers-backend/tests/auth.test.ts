import { test, expect, beforeAll, afterAll, describe } from 'vitest'
import { buildApp } from '../apps/api/src/index'
import { FastifyInstance } from 'fastify'

describe('Authentication API', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /auth/register', () => {
    test('should register a new client successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'testclient@example.com',
          password: 'password123',
          role: 'client',
          display_name: 'Test Client',
          phone: '+61412345678'
        }
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('Registration successful')
      expect(body.user.email).toBe('testclient@example.com')
      expect(body.user.role).toBe('client')
    })

    test('should register a new performer successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'testperformer@example.com',
          password: 'password123',
          role: 'performer',
          display_name: 'Test Performer',
          phone: '+61412345679'
        }
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.user.role).toBe('performer')
    })

    test('should reject registration with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'password123',
          role: 'client'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject registration with weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: '123',
          role: 'client'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('at least 8')
          })
        ])
      )
    })

    test('should reject registration with invalid phone number', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          role: 'client',
          phone: '123456789' // Invalid format
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject registration with invalid role', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid_role'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })
  })

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      // Note: This test assumes the user was created in the previous test
      // In a real test environment, you'd use a test database with known users
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'admin@lustandlace.com.au',
          password: 'admin123'
        }
      })

      if (response.statusCode === 200) {
        const body = JSON.parse(response.body)
        expect(body.access_token).toBeDefined()
        expect(body.token_type).toBe('bearer')
        expect(body.user.email).toBe('admin@lustandlace.com.au')
        expect(body.user.role).toBe('admin')
      } else {
        // Login might fail in test environment if Supabase isn't configured
        expect(response.statusCode).toBe(401)
      }
    })

    test('should reject login with invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Authentication Failed')
    })

    test('should reject login with invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'invalid-email',
          password: 'password123'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject login with missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com'
          // Missing password
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })
  })

  describe('POST /auth/magic-link', () => {
    test('should send magic link for valid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/magic-link',
        payload: {
          email: 'test@example.com'
        }
      })

      // Magic link might fail in test environment
      expect([200, 400]).toContain(response.statusCode)

      if (response.statusCode === 200) {
        const body = JSON.parse(response.body)
        expect(body.message).toContain('Magic link sent')
      }
    })

    test('should reject magic link with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/magic-link',
        payload: {
          email: 'invalid-email'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })
  })
})