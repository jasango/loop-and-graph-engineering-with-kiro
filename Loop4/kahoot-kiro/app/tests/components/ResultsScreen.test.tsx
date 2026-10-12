import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ResultsScreen } from '../../src/components/ResultsScreen'

describe('ResultsScreen', () => {
  it('shows score, hits, and calculated percentage', () => {
    render(<ResultsScreen score={1500} correctAnswers={15} totalQuestions={20} onRestart={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '¡Buen trabajo!' })).toBeInTheDocument()
    expect(screen.getByText('1500')).toBeInTheDocument()
    expect(screen.getByText('15 / 20')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('restarts the game from the results action', async () => {
    const onRestart = vi.fn()
    render(<ResultsScreen score={0} correctAnswers={0} totalQuestions={20} onRestart={onRestart} />)
    await userEvent.click(screen.getByRole('button', { name: /jugar de nuevo/i }))
    expect(onRestart).toHaveBeenCalledOnce()
  })
})
