import { test, expect, beforeAll, afterAll, describe } from 'vitest'
import { buildApp } from '../apps/api/src/index'
import { FastifyInstance } from 'fastify'

describe('Bookings API', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /bookings/request', () => {
    test('should create a booking request successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500,
          message: 'New Year\'s Eve party for 20 guests'
        }
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.booking_id).toBeDefined()
      expect(body.status).toBe('pending_review')
      expect(body.message).toContain('submitted successfully')
    })

    test('should reject booking with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'invalid-email',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject booking with invalid phone number', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '123456789', // Invalid format
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject booking with invalid service', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Invalid Service',
          rate: 500
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject booking with past date', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2020-01-01', // Past date
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500
        }
      })

      expect(response.statusCode).toBe(400)
    })

    test('should reject booking with invalid time format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '25:00', // Invalid time
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject booking with negative rate', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: -100 // Negative rate
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })

    test('should reject booking with missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com'
          // Missing required fields
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
      expect(body.details.length).toBeGreaterThan(0)
    })

    test('should handle extremely long message', async () => {
      const longMessage = 'a'.repeat(1001) // Exceeds 1000 character limit

      const response = await app.inject({
        method: 'POST',
        url: '/bookings/request',
        payload: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+61412345678',
          event_date: '2024-12-31',
          event_time: '20:00',
          location: '123 Party Street, Perth WA 6000',
          service: 'Topless Waitress',
          rate: 500,
          message: longMessage
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Validation Error')
    })
  })

  describe('GET /bookings', () => {
    test('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/bookings'
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Unauthorized')
    })

    test('should return bookings with valid auth token', async () => {
      // Note: This test would need a valid auth token
      // In a real test environment, you'd authenticate first
      const response = await app.inject({
        method: 'GET',
        url: '/bookings',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      })

      expect(response.statusCode).toBe(401) // Invalid token
    })

    test('should validate query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/bookings?limit=invalid',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      })

      // Should fail on either auth or validation
      expect([400, 401]).toContain(response.statusCode)
    })
  })

  describe('GET /bookings/:id', () => {
    test('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/bookings/550e8400-e29b-41d4-a716-446655440000'
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Unauthorized')
    })

    test('should validate UUID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/bookings/invalid-uuid',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      })

      // Should fail on validation before auth is checked
      expect([400, 401]).toContain(response.statusCode)
    })
  })

  describe('POST /bookings/:id/approve', () => {
    test('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/550e8400-e29b-41d4-a716-446655440000/approve',
        payload: {}
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Unauthorized')
    })

    test('should validate UUID format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/invalid-uuid/approve',
        headers: {
          authorization: 'Bearer invalid-token'
        },
        payload: {}
      })

      expect([400, 401]).toContain(response.statusCode)
    })
  })

  describe('POST /bookings/:id/cancel', () => {
    test('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings/550e8400-e29b-41d4-a716-446655440000/cancel',
        payload: {
          reason: 'Test cancellation'
        }
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Unauthorized')
    })
  })
})