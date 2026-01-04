import { render, screen, fireEvent } from '@testing-library/react'
import { HoleInput } from '@/components/scorecard/HoleInput'

describe('HoleInput', () => {
  const defaultProps = {
    holeNumber: 1,
    par: 4,
    onScoreChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders hole number correctly', () => {
      render(<HoleInput {...defaultProps} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders par value correctly', () => {
      render(<HoleInput {...defaultProps} par={5} />)
      expect(screen.getByText('Par 5')).toBeInTheDocument()
    })

    it('renders Hole label', () => {
      render(<HoleInput {...defaultProps} />)
      expect(screen.getByText('Hole')).toBeInTheDocument()
    })

    it('displays dash when no score', () => {
      render(<HoleInput {...defaultProps} />)
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('displays score when provided', () => {
      render(<HoleInput {...defaultProps} score={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders plus and minus buttons', () => {
      render(<HoleInput {...defaultProps} />)
      expect(screen.getByText('+')).toBeInTheDocument()
      expect(screen.getByText('−')).toBeInTheDocument()
    })
  })

  describe('Score to Par Display', () => {
    it('shows E for par score', () => {
      render(<HoleInput {...defaultProps} par={4} score={4} />)
      expect(screen.getByText('E')).toBeInTheDocument()
    })

    it('shows negative number for under par', () => {
      render(<HoleInput {...defaultProps} par={4} score={3} />)
      expect(screen.getByText('-1')).toBeInTheDocument()
    })

    it('shows positive number for over par', () => {
      render(<HoleInput {...defaultProps} par={4} score={5} />)
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('shows +2 for double bogey', () => {
      render(<HoleInput {...defaultProps} par={4} score={6} />)
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('shows -2 for eagle', () => {
      render(<HoleInput {...defaultProps} par={4} score={2} />)
      expect(screen.getByText('-2')).toBeInTheDocument()
    })
  })

  describe('Color Coding', () => {
    it('applies green color for birdie (under par)', () => {
      const { container } = render(
        <HoleInput {...defaultProps} par={4} score={3} />
      )
      expect(container.querySelector('.text-fairway-600')).toBeInTheDocument()
      expect(container.querySelector('.bg-fairway-50')).toBeInTheDocument()
    })

    it('applies red color for bogey (over par)', () => {
      const { container } = render(
        <HoleInput {...defaultProps} par={4} score={5} />
      )
      expect(container.querySelector('.text-red-600')).toBeInTheDocument()
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
    })

    it('applies neutral color for par score', () => {
      const { container } = render(
        <HoleInput {...defaultProps} par={4} score={4} />
      )
      expect(container.querySelector('.text-gray-900')).toBeInTheDocument()
    })
  })

  describe('Plus Button Behavior', () => {
    it('sets initial score to par+1 when clicking plus with no score', () => {
      const onScoreChange = jest.fn()
      render(<HoleInput {...defaultProps} par={4} onScoreChange={onScoreChange} />)

      fireEvent.click(screen.getByText('+'))
      expect(onScoreChange).toHaveBeenCalledWith(5) // par + 1
    })

    it('increments score by 1 when clicking plus', () => {
      const onScoreChange = jest.fn()
      render(
        <HoleInput
          {...defaultProps}
          score={4}
          onScoreChange={onScoreChange}
        />
      )

      fireEvent.click(screen.getByText('+'))
      expect(onScoreChange).toHaveBeenCalledWith(5)
    })

    it('does not increment above 20', () => {
      const onScoreChange = jest.fn()
      render(
        <HoleInput
          {...defaultProps}
          score={20}
          onScoreChange={onScoreChange}
        />
      )

      fireEvent.click(screen.getByText('+'))
      expect(onScoreChange).not.toHaveBeenCalled()
    })

    it('disables plus button at max score', () => {
      render(<HoleInput {...defaultProps} score={20} />)
      expect(screen.getByText('+')).toBeDisabled()
    })
  })

  describe('Minus Button Behavior', () => {
    it('sets initial score to par-1 when clicking minus with no score', () => {
      const onScoreChange = jest.fn()
      render(<HoleInput {...defaultProps} par={4} onScoreChange={onScoreChange} />)

      fireEvent.click(screen.getByText('−'))
      expect(onScoreChange).toHaveBeenCalledWith(3) // par - 1
    })

    it('decrements score by 1 when clicking minus', () => {
      const onScoreChange = jest.fn()
      render(
        <HoleInput
          {...defaultProps}
          score={4}
          onScoreChange={onScoreChange}
        />
      )

      fireEvent.click(screen.getByText('−'))
      expect(onScoreChange).toHaveBeenCalledWith(3)
    })

    it('does not decrement below 1', () => {
      const onScoreChange = jest.fn()
      render(
        <HoleInput
          {...defaultProps}
          score={1}
          onScoreChange={onScoreChange}
        />
      )

      fireEvent.click(screen.getByText('−'))
      expect(onScoreChange).not.toHaveBeenCalled()
    })

    it('disables minus button at min score', () => {
      render(<HoleInput {...defaultProps} score={1} />)
      expect(screen.getByText('−')).toBeDisabled()
    })
  })

  describe('Disabled State', () => {
    it('disables both buttons when disabled prop is true', () => {
      render(<HoleInput {...defaultProps} score={4} disabled />)

      expect(screen.getByText('+')).toBeDisabled()
      expect(screen.getByText('−')).toBeDisabled()
    })

    it('applies opacity class when disabled', () => {
      const { container } = render(<HoleInput {...defaultProps} disabled />)
      expect(container.firstChild).toHaveClass('opacity-50')
    })

    it('does not call onScoreChange when disabled', () => {
      const onScoreChange = jest.fn()
      render(
        <HoleInput
          {...defaultProps}
          score={4}
          disabled
          onScoreChange={onScoreChange}
        />
      )

      fireEvent.click(screen.getByText('+'))
      fireEvent.click(screen.getByText('−'))
      expect(onScoreChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-label on minus button', () => {
      render(<HoleInput {...defaultProps} />)
      expect(
        screen.getByLabelText('Decrease score for hole 1')
      ).toBeInTheDocument()
    })

    it('has aria-label on plus button', () => {
      render(<HoleInput {...defaultProps} />)
      expect(
        screen.getByLabelText('Increase score for hole 1')
      ).toBeInTheDocument()
    })

    it('updates aria-label based on hole number', () => {
      render(<HoleInput {...defaultProps} holeNumber={7} />)
      expect(
        screen.getByLabelText('Decrease score for hole 7')
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Increase score for hole 7')
      ).toBeInTheDocument()
    })

    it('has tap-target class for touch accessibility', () => {
      const { container } = render(<HoleInput {...defaultProps} />)
      expect(container.querySelector('.tap-target')).toBeInTheDocument()
    })
  })

  describe('Custom ClassName', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <HoleInput {...defaultProps} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('merges custom className with default classes', () => {
      const { container } = render(
        <HoleInput {...defaultProps} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
      expect(container.firstChild).toHaveClass('rounded-lg')
    })
  })

  describe('Edge Cases', () => {
    it('handles par 3 correctly', () => {
      render(<HoleInput {...defaultProps} par={3} score={2} />)
      expect(screen.getByText('Par 3')).toBeInTheDocument()
      expect(screen.getByText('-1')).toBeInTheDocument()
    })

    it('handles par 5 correctly', () => {
      render(<HoleInput {...defaultProps} par={5} score={7} />)
      expect(screen.getByText('Par 5')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('handles hole number 18', () => {
      render(<HoleInput {...defaultProps} holeNumber={18} />)
      expect(screen.getByText('18')).toBeInTheDocument()
    })

    it('handles very high score (max allowed)', () => {
      render(<HoleInput {...defaultProps} par={4} score={20} />)
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('+16')).toBeInTheDocument()
    })
  })
})
