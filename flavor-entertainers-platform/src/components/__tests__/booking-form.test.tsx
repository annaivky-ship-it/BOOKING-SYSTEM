import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking/booking-form'

// Mock the hooks and utilities
jest.mock('@/hooks/useWhatsAppNotify', () => ({
  useWhatsAppNotify: () => ({
    sendBookingConfirmation: jest.fn().mockResolvedValue({ success: true }),
    isLoading: false,
  }),
}))

const mockPerformer = {
  id: '1',
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

describe('BookingForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders booking form with performer details', () => {
    render(<BookingForm performer={mockPerformer} />)

    expect(screen.getByText('Book Test Performer')).toBeInTheDocument()
    expect(screen.getByText('Sydney')).toBeInTheDocument()
  })

  it('shows all required form fields', () => {
    render(<BookingForm performer={mockPerformer} />)

    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/venue/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<BookingForm performer={mockPerformer} />)

    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('handles form submission with valid data', async () => {
    render(<BookingForm performer={mockPerformer} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/client name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0412345678')
    await user.type(screen.getByLabelText(/venue/i), 'Test Venue')

    // Select service
    const serviceSelect = screen.getByRole('combobox')
    await user.click(serviceSelect)
    await user.click(screen.getByText('Dance Performance'))

    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    await user.click(submitButton)

    // Form should progress to next step
    await waitFor(() => {
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
    })
  })

  it('calculates total amount correctly', async () => {
    render(<BookingForm performer={mockPerformer} />)

    // Select service and set duration
    const serviceSelect = screen.getByRole('combobox')
    await user.click(serviceSelect)
    await user.click(screen.getByText('Dance Performance'))

    // Duration should show the calculated rate
    await waitFor(() => {
      expect(screen.getByText('$200')).toBeInTheDocument()
    })
  })

  it('shows service selection options', () => {
    render(<BookingForm performer={mockPerformer} />)

    expect(screen.getByText('Select Service')).toBeInTheDocument()

    // Click to open dropdown
    const serviceSelect = screen.getByRole('combobox')
    fireEvent.click(serviceSelect)

    expect(screen.getByText('Dance Performance')).toBeInTheDocument()
  })
})