import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Timer } from '../../src/components/Timer'

describe('Timer', () => {
  it('shows seconds and safe state above ten seconds', () => {
    render(<Timer timeRemaining={15} />)
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '15 segundos restantes')
    expect(screen.getByRole('timer').className).toContain('safe')
  })
  it('uses warning and critical thresholds', () => {
    const { rerender } = render(<Timer timeRemaining={10} />)
    expect(screen.getByRole('timer').className).toContain('warning')
    rerender(<Timer timeRemaining={4} />)
    expect(screen.getByRole('timer').className).toContain('critical')
  })
})
