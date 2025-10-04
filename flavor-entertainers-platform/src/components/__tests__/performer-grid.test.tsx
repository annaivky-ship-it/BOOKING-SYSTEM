import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PerformerGrid } from '@/components/performers/performer-grid'

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
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
        ],
        error: null
      })
    }))
  })
}))

describe('PerformerGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<PerformerGrid />)
    expect(screen.getByText('Loading performers...')).toBeInTheDocument()
  })

  it('renders performers after loading', async () => {
    render(<PerformerGrid />)

    await waitFor(() => {
      expect(screen.getByText('Test Performer')).toBeInTheDocument()
    })

    expect(screen.getByText('Sydney')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(10)')).toBeInTheDocument()
  })

  it('shows search functionality', async () => {
    render(<PerformerGrid />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search performers...')).toBeInTheDocument()
    })
  })

  it('shows filter options', async () => {
    render(<PerformerGrid />)

    await waitFor(() => {
      expect(screen.getByText('All Locations')).toBeInTheDocument()
      expect(screen.getByText('All Services')).toBeInTheDocument()
    })
  })

  it('handles search input', async () => {
    render(<PerformerGrid />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search performers...')
      fireEvent.change(searchInput, { target: { value: 'Test' } })
      expect(searchInput).toHaveValue('Test')
    })
  })

  it('displays performer details correctly', async () => {
    render(<PerformerGrid />)

    await waitFor(() => {
      // Check if performer card shows all necessary information
      expect(screen.getByText('Test Performer')).toBeInTheDocument()
      expect(screen.getByText('Sydney')).toBeInTheDocument()
      expect(screen.getByText('Dance Performance')).toBeInTheDocument()
      expect(screen.getByText('$200/hour')).toBeInTheDocument()
    })
  })
})