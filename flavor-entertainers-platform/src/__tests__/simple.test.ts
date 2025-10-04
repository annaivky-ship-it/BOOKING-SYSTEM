// Simple test to verify Jest setup works
describe('Testing Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello Flavor Entertainers'
    expect(greeting).toContain('Flavor')
    expect(greeting.toLowerCase()).toBe('hello flavor entertainers')
  })

  it('should handle array operations', () => {
    const performers = ['Anna', 'Sophie', 'Emma']
    expect(performers).toHaveLength(3)
    expect(performers).toContain('Anna')
    expect(performers[0]).toBe('Anna')
  })

  it('should handle object operations', () => {
    const booking = {
      id: 'booking-123',
      performer: 'Anna',
      date: '2024-01-15',
      status: 'confirmed'
    }

    expect(booking).toHaveProperty('id')
    expect(booking.performer).toBe('Anna')
    expect(booking.status).toBe('confirmed')
  })

  it('should handle async operations', async () => {
    const mockApiCall = () => Promise.resolve({ success: true, data: 'test' })

    const result = await mockApiCall()
    expect(result.success).toBe(true)
    expect(result.data).toBe('test')
  })
})

// Test utility functions
describe('Utility Tests', () => {
  const formatCurrency = (amount: number, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const generateBookingRef = () => {
    return `FE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00')
    expect(formatCurrency(99.99)).toBe('$99.99')
  })

  it('should validate emails correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
  })

  it('should generate booking references', () => {
    const ref = generateBookingRef()
    expect(ref).toMatch(/^FE-[A-Z0-9]{6}$/)
  })
})

// Mock component tests (without JSX)
describe('Mock Component Tests', () => {
  const MockButton = ({ children, onClick, disabled = false }: any) => ({
    type: 'button',
    props: { children, onClick, disabled }
  })

  it('should render mock button component', () => {
    const mockComponent = MockButton({ children: 'Click me', onClick: jest.fn() })
    expect(mockComponent.props.children).toBe('Click me')
    expect(mockComponent.type).toBe('button')
  })
})