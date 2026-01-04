import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders as a button element', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('displays Loading... text when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('hides children when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('shows spinner animation when loading', () => {
      const { container } = render(<Button loading>Submit</Button>)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not fire click when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not fire click when loading', () => {
      const handleClick = jest.fn()
      render(
        <Button loading onClick={handleClick}>
          Click me
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Submit</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is not disabled by default', () => {
      render(<Button>Submit</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button>Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-fairway-600')
    })

    it('applies primary variant styles explicitly', () => {
      render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-fairway-600')
    })

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100')
    })

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })
  })

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[48px]')
    })

    it('applies small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[40px]')
    })

    it('applies medium size explicitly', () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[48px]')
    })

    it('applies large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('min-h-[56px]')
    })
  })

  describe('Full Width', () => {
    it('does not apply full width by default', () => {
      render(<Button>Not Full</Button>)
      expect(screen.getByRole('button')).not.toHaveClass('w-full')
    })

    it('applies full width when prop is true', () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByRole('button')).toHaveClass('w-full')
    })
  })

  describe('Custom ClassName', () => {
    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-fairway-600') // Still has default variant
    })
  })

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('passes through aria attributes', () => {
      render(<Button aria-label="Custom label">Click</Button>)
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })

    it('supports focus ring styling', () => {
      render(<Button>Focusable</Button>)
      expect(screen.getByRole('button')).toHaveClass('focus:ring-2')
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('HTML button attributes', () => {
    it('passes through type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('passes through form attribute', () => {
      render(<Button form="my-form">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('form', 'my-form')
    })
  })
})
