import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuestionCard } from '../../src/components/QuestionCard'
import type { Question } from '../../src/data/questions'

const question: Question = { id: 'q1', question: '¿Cuál?', options: ['Uno', 'Dos', 'Tres', 'Cuatro'], correctOption: 1, explanation: 'Porque sí.' }

describe('QuestionCard', () => {
  it('renders four options and reports a selection', () => {
    const onSelect = vi.fn()
    render(<QuestionCard question={question} onSelect={onSelect} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: /opción 2/i }))
    expect(onSelect).toHaveBeenCalledWith(1)
  })
  it('locks options after an answer', () => {
    render(<QuestionCard question={question} selectedOption={0} onSelect={vi.fn()} />)
    expect(screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
  })
})
