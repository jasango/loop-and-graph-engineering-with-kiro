import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuizScreen } from '../../src/components/QuizScreen'
import type { Question } from '../../src/data/questions'

const question: Question = { id: 1, question: '¿Qué opción?', options: ['A', 'B', 'C', 'D'], correctOption: 2, explanation: 'Explicación.' }

describe('QuizScreen', () => {
  it('shows progress, timer and question', () => {
    render(<QuizScreen question={question} questionIndex={1} questionCount={20} timeRemaining={12} onSelect={vi.fn()} />)
    expect(screen.getByText('Pregunta 2 de 20')).toBeInTheDocument()
    expect(screen.getByText('¿Qué opción?')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '12 segundos restantes')
  })
  it('shows feedback and disables answers after selection', () => {
    render(<QuizScreen question={question} questionIndex={0} questionCount={20} timeRemaining={3} selectedOption={0} correctOption={2} showFeedback onSelect={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Respuesta incorrecta')
    expect(screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
  })
})
