import { describe, expect, it } from 'vitest'
import questionsData from '../../src/data/questions.json'
import { getQuestions, questions, validateQuestions } from '../../src/data/questions'
import type { Question } from '../../src/data/questions'

describe('Kiro question bank', () => {
  it('contains exactly 20 valid questions in source order', () => {
    expect(validateQuestions(questionsData)).toEqual({ valid: true })
    expect(questions).toHaveLength(20)
    expect(questions.map(({ id }) => id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `kiro-${String(index + 1).padStart(2, '0')}`),
    )
  })

  it('gives every question four options and one valid answer index', () => {
    questions.forEach((question: Question) => {
      expect(question.options).toHaveLength(4)
      expect(question.options.every((option) => option.trim().length > 0)).toBe(true)
      expect(question.correctOption).toBeGreaterThanOrEqual(0)
      expect(question.correctOption).toBeLessThan(4)
      expect(question.question.trim()).not.toBe('')
      expect(question.explanation.trim()).not.toBe('')
    })
  })

  it('exposes the static collection through getQuestions without remote loading', () => {
    expect(getQuestions()).toBe(questions)
    expect(getQuestions()).toHaveLength(20)
  })

  it('reports malformed question data with useful errors', () => {
    const result = validateQuestions([{ id: 'duplicate', question: '', options: ['one'], correctOption: 4, explanation: '' }])

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors).toEqual(expect.arrayContaining([
        'Question 1 must have a question.',
        'Question 1 must have exactly four non-empty options.',
        'Question 1 must have a correctOption between 0 and 3.',
        'Question 1 must have an explanation.',
      ]))
    }
  })
})
