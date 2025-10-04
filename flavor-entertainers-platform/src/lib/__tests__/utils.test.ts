import { cn, formatCurrency, formatDate, generateBookingReference, validatePhoneNumber } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('merges classNames correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'hover:bg-red-600')
      expect(result).toContain('bg-red-500')
      expect(result).toContain('text-white')
      expect(result).toContain('hover:bg-red-600')
    })

    it('handles conditional classNames', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('hidden-class')
    })

    it('handles undefined values', () => {
      const result = cn('base-class', undefined, null, 'another-class')
      expect(result).toContain('base-class')
      expect(result).toContain('another-class')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(99.99)).toBe('$99.99')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('handles different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00')
      expect(formatCurrency(100, 'GBP')).toBe('£100.00')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('handles different date formats', () => {
      const date = new Date('2024-12-25T15:45:00Z')
      expect(formatDate(date, 'long')).toContain('December')
      expect(formatDate(date, 'short')).toBe('25/12/2024')
    })

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate)).toBe('Invalid Date')
    })
  })

  describe('generateBookingReference', () => {
    it('generates reference with correct prefix', () => {
      const ref = generateBookingReference()
      expect(ref).toMatch(/^FE-[A-Z0-9]{6}$/)
    })

    it('generates unique references', () => {
      const ref1 = generateBookingReference()
      const ref2 = generateBookingReference()
      expect(ref1).not.toBe(ref2)
    })

    it('uses custom prefix when provided', () => {
      const ref = generateBookingReference('TEST')
      expect(ref).toMatch(/^TEST-[A-Z0-9]{6}$/)
    })
  })

  describe('validatePhoneNumber', () => {
    it('validates Australian mobile numbers', () => {
      expect(validatePhoneNumber('0412345678')).toBe(true)
      expect(validatePhoneNumber('0487654321')).toBe(true)
      expect(validatePhoneNumber('+61412345678')).toBe(true)
    })

    it('validates Australian landline numbers', () => {
      expect(validatePhoneNumber('0298765432')).toBe(true)
      expect(validatePhoneNumber('0398765432')).toBe(true)
      expect(validatePhoneNumber('+61298765432')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('abcd')).toBe(false)
      expect(validatePhoneNumber('0123456789')).toBe(false) // Invalid area code
      expect(validatePhoneNumber('')).toBe(false)
    })

    it('handles international formats', () => {
      expect(validatePhoneNumber('+61-4-1234-5678')).toBe(true)
      expect(validatePhoneNumber('+61 4 1234 5678')).toBe(true)
      expect(validatePhoneNumber('+61 (04) 1234 5678')).toBe(true)
    })
  })
})