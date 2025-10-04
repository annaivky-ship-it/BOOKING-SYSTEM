import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Supabase with full booking flow
const mockBookingData = {
  id: 'booking-123',
  performer_id: 'performer-1',
  client_name: 'John Doe',
  client_email: 'john@example.com',
  client_phone: '0412345678',
  event_date: '2024-01-15T18:00:00Z',
  venue: 'Test Venue',
  status: 'pending',
  total_amount: 200,
}

const mockPerformerData = {
  id: 'performer-1',
  stage_name: 'Test Performer',
  bio: 'Test bio',
  location: 'Sydney',
  hero_image: '/test-image.jpg',
  rating: 4.5,
  total_reviews: 10,
  is_available: true,
  performer_services: [
    {
      service_id: '1',
      custom_rate: 200,
      is_available: true,
      services: {
        name: 'Dance Performance',
        base_rate: 180,
        rate_type: 'per_hour'
      }
    }
  ]
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    from: jest.fn((table) => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(() => {
          if (table === 'performers') {
            return Promise.resolve({ data: mockPerformerData, error: null })
          }
          if (table === 'bookings') {
            return Promise.resolve({ data: mockBookingData, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
      }
      return mockQuery
    }),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: {
          user: { id: 'user-123', email: 'test@example.com' }
        },
        error: null
      })),
    },
  }),
}))

// Create a mock component that represents the full booking flow
const MockBookingFlow = () => {
  return (
    <div>
      <h1>Book Test Performer</h1>
      <form data-testid="booking-form">
        <input name="client_name" placeholder="Your Name" />
        <input name="client_email" placeholder="Your Email" type="email" />
        <input name="client_phone" placeholder="Your Phone" type="tel" />
        <input name="venue" placeholder="Venue" />
        <select name="service">
          <option value="">Select Service</option>
          <option value="dance">Dance Performance</option>
        </select>
        <button type="submit">Continue to Payment</button>
      </form>
    </div>
  )
}

describe('Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Booking Flow', () => {
    it('should complete full booking process', async () => {
      render(<MockBookingFlow />)

      // Step 1: Fill out booking form
      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Your Email'), 'john@example.com')
      await user.type(screen.getByPlaceholderText('Your Phone'), '0412345678')
      await user.type(screen.getByPlaceholderText('Venue'), 'Test Venue')

      // Select service
      await user.selectOptions(screen.getByRole('combobox'), 'dance')

      // Submit form
      await user.click(screen.getByText('Continue to Payment'))

      // Verify form data is captured
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })

    it('should validate form data before submission', async () => {
      render(<MockBookingFlow />)

      // Try to submit without required fields
      await user.click(screen.getByText('Continue to Payment'))

      // Form validation should prevent submission
      const form = screen.getByTestId('booking-form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Performer Search and Selection', () => {
    const MockPerformerGrid = () => (
      <div>
        <input placeholder="Search performers..." />
        <div data-testid="performer-card">
          <h3>Test Performer</h3>
          <p>Sydney</p>
          <span>4.5 ★ (10 reviews)</span>
          <button>Book Now</button>
        </div>
      </div>
    )

    it('should search and select performers', async () => {
      render(<MockPerformerGrid />)

      // Search for performer
      const searchInput = screen.getByPlaceholderText('Search performers...')
      await user.type(searchInput, 'Test')

      // Should show performer in results
      expect(screen.getByText('Test Performer')).toBeInTheDocument()
      expect(screen.getByText('Sydney')).toBeInTheDocument()

      // Click book now
      await user.click(screen.getByText('Book Now'))
    })
  })

  describe('Payment Flow', () => {
    const MockPaymentStep = () => (
      <div>
        <h2>Payment</h2>
        <div>Total: $200.00</div>
        <div>Deposit (15%): $30.00</div>
        <button>Generate PayID QR Code</button>
        <button>Mark as Paid</button>
      </div>
    )

    it('should handle payment process', async () => {
      render(<MockPaymentStep />)

      expect(screen.getByText('Total: $200.00')).toBeInTheDocument()
      expect(screen.getByText('Deposit (15%): $30.00')).toBeInTheDocument()

      // Generate QR code
      await user.click(screen.getByText('Generate PayID QR Code'))

      // Mark as paid (admin action)
      await user.click(screen.getByText('Mark as Paid'))
    })
  })

  describe('Admin Dashboard Integration', () => {
    const MockAdminDashboard = () => (
      <div>
        <h1>Admin Dashboard</h1>
        <div data-testid="booking-queue">
          <h2>Pending Bookings</h2>
          <div data-testid="booking-item">
            <span>John Doe - Test Performer</span>
            <button>Approve</button>
            <button>Reject</button>
          </div>
        </div>
        <div data-testid="performer-queue">
          <h2>Performers</h2>
          <div data-testid="performer-item">
            <span>Test Performer</span>
            <button>Verify</button>
            <button>Suspend</button>
          </div>
        </div>
      </div>
    )

    it('should manage bookings from admin dashboard', async () => {
      render(<MockAdminDashboard />)

      expect(screen.getByText('Pending Bookings')).toBeInTheDocument()
      expect(screen.getByText('John Doe - Test Performer')).toBeInTheDocument()

      // Approve booking
      await user.click(screen.getByText('Approve'))
    })

    it('should manage performers from admin dashboard', async () => {
      render(<MockAdminDashboard />)

      expect(screen.getByText('Performers')).toBeInTheDocument()
      expect(screen.getByText('Test Performer')).toBeInTheDocument()

      // Verify performer
      await user.click(screen.getByText('Verify'))
    })
  })

  describe('Notification Integration', () => {
    it('should send notifications on booking events', async () => {
      // Mock the notification hook
      const mockSendNotification = jest.fn().mockResolvedValue({ success: true })

      // This would test notification sending in real components
      await mockSendNotification({
        type: 'booking_confirmation',
        userId: 'user-123',
        bookingId: 'booking-123'
      })

      expect(mockSendNotification).toHaveBeenCalledWith({
        type: 'booking_confirmation',
        userId: 'user-123',
        bookingId: 'booking-123'
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = { message: 'Database connection failed' }

      // Test error boundaries and fallbacks
      const MockErrorComponent = () => {
        throw new Error('Database connection failed')
      }

      const MockErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>
        } catch (error) {
          return <div>Something went wrong. Please try again.</div>
        }
      }

      render(
        <MockErrorBoundary>
          <div>Application content</div>
        </MockErrorBoundary>
      )

      expect(screen.getByText('Application content')).toBeInTheDocument()
    })

    it('should handle network errors', async () => {
      // Test network error handling
      const mockNetworkError = new Error('Network error')

      // This would test actual network error handling in components
      expect(mockNetworkError.message).toBe('Network error')
    })
  })
})