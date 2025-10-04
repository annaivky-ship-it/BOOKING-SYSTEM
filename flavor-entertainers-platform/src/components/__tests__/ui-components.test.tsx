import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

describe('UI Components', () => {
  describe('Button', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('applies variant classes correctly', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByText('Delete')
      expect(button).toHaveClass('bg-destructive')
    })

    it('applies size classes correctly', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByText('Small')
      expect(button).toHaveClass('h-9')
    })

    it('can be disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByText('Disabled')
      expect(button).toBeDisabled()
    })
  })

  describe('Card', () => {
    it('renders card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test Content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Badge', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('applies variant classes correctly', () => {
      render(<Badge variant="destructive">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('border-destructive/50')
    })
  })
})