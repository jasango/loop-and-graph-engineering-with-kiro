import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StartScreen } from '../../src/components/StartScreen'

describe('StartScreen', () => {
  it('shows the game introduction and question details', () => {
    render(<StartScreen onStart={vi.fn()} questionCount={20} />)
    expect(screen.getByRole('heading', { name: 'Kahoot! de Kiro' })).toBeInTheDocument()
    expect(screen.getByText(/20 preguntas/)).toBeInTheDocument()
    expect(screen.getByText(/15 s/)).toBeInTheDocument()
  })

  it('starts the game when the button is activated', async () => {
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /comenzar/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })
})
