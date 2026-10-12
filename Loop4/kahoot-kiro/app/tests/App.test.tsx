import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import App from '../src/App'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('App', () => {
  it('starts a game and renders the first question', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Kahoot! de Kiro' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Comenzar/ }))

    expect(screen.getByText('Pregunta 1 de 20')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '15 segundos restantes')
  })

  it('locks an answer, shows feedback, and advances after two seconds', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Comenzar/ }))
    fireEvent.click(screen.getAllByRole('button').find((button) => button.textContent?.includes('A'))!)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Respuesta (correcta|incorrecta)/)
    expect(screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(screen.getByText('Pregunta 1 de 20')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByText('Pregunta 2 de 20')).toBeInTheDocument()
  })

  it('times out unanswered questions and reveals the solution', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Comenzar/ }))
    act(() => {
      vi.advanceTimersByTime(15000)
    })

    expect(screen.getByRole('status')).toHaveTextContent('¡Se acabó el tiempo!')
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '0 segundos restantes')
  })

  it('returns to the initial screen when restarting from results', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Comenzar/ }))

    for (let question = 0; question < 20; question += 1) {
      fireEvent.click(screen.getAllByRole('button')[0])
      act(() => {
        vi.advanceTimersByTime(2000)
      })
    }

    expect(screen.getByRole('heading', { name: '¡Buen trabajo!' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Jugar de nuevo/ }))
    expect(screen.getByRole('heading', { name: 'Kahoot! de Kiro' })).toBeInTheDocument()
  })
})
