import { renderHook, waitFor } from '@testing-library/react'
import { useWhatsAppNotify } from '@/hooks/useWhatsAppNotify'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('useWhatsAppNotify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should send SMS notification successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'test-message-id',
      twilioSid: 'test-twilio-sid',
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    })

    const { result } = renderHook(() => useWhatsAppNotify())

    const response = await result.current.sendSMS(
      '+61412345678',
      'Test message',
      'user-id',
      'booking-id'
    )

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'sms',
        to: '+61412345678',
        message: 'Test message',
        userId: 'user-id',
        bookingId: 'booking-id',
      }),
    })

    expect(response).toEqual(mockResponse)
  })

  it('should send WhatsApp notification successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'test-message-id',
      twilioSid: 'test-twilio-sid',
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    })

    const { result } = renderHook(() => useWhatsAppNotify())

    const response = await result.current.sendWhatsApp(
      '+61412345678',
      'Test WhatsApp message'
    )

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'whatsapp',
        to: '+61412345678',
        message: 'Test WhatsApp message',
        userId: undefined,
        bookingId: undefined,
      }),
    })

    expect(response).toEqual(mockResponse)
  })

  it('should send template notification successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'test-message-id',
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    })

    const { result } = renderHook(() => useWhatsAppNotify())

    const response = await result.current.sendTemplate(
      'booking_confirmation',
      'user-id',
      { client_name: 'John Doe' },
      'booking-id'
    )

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'template',
        templateKey: 'booking_confirmation',
        userId: 'user-id',
        variables: { client_name: 'John Doe' },
        bookingId: 'booking-id',
      }),
    })

    expect(response).toEqual(mockResponse)
  })

  it('should handle booking confirmation template', async () => {
    const mockResponse = { success: true }
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    })

    const { result } = renderHook(() => useWhatsAppNotify())

    const bookingData = {
      id: 'booking-123',
      client_name: 'John Doe',
      event_date: '2024-01-15T18:00:00Z',
      venue: 'Test Venue',
      service_type: 'Dance Performance',
      booking_reference: 'FE-001',
    }

    await result.current.sendBookingConfirmation('user-id', bookingData)

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'template',
        templateKey: 'booking_confirmation',
        userId: 'user-id',
        variables: {
          client_name: 'John Doe',
          event_date: '15/01/2024',
          event_time: expect.any(String),
          venue: 'Test Venue',
          service_type: 'Dance Performance',
          booking_reference: 'FE-001',
        },
        bookingId: 'booking-123',
      }),
    })
  })

  it('should handle API errors gracefully', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'API Error',
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockErrorResponse),
    })

    const { result } = renderHook(() => useWhatsAppNotify())

    const response = await result.current.sendSMS('+61412345678', 'Test message')

    expect(response).toEqual(mockErrorResponse)
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useWhatsAppNotify())

    const response = await result.current.sendSMS('+61412345678', 'Test message')

    expect(response).toEqual({
      success: false,
      error: 'Failed to send notification',
    })
  })

  it('should track loading state', async () => {
    mockFetch.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ json: () => ({ success: true }) }), 100))
    )

    const { result } = renderHook(() => useWhatsAppNotify())

    expect(result.current.isLoading).toBe(false)

    const promise = result.current.sendSMS('+61412345678', 'Test message')

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await promise

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})