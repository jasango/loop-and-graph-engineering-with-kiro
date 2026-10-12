import rawQuestions from './questions.json'

export interface Question {
  id: string | number
  question: string
  options: [string, string, string, string]
  correctOption: 0 | 1 | 2 | 3
  explanation: string
}

export type QuestionValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export function validateQuestions(value: unknown): QuestionValidationResult {
  const errors: string[] = []

  if (!Array.isArray(value)) {
    return { valid: false, errors: ['Questions data must be an array.'] }
  }

  const ids = new Set<string | number>()
  value.forEach((candidate, index) => {
    const prefix = `Question ${index + 1}`
    if (typeof candidate !== 'object' || candidate === null) {
      errors.push(`${prefix} must be an object.`)
      return
    }

    const item = candidate as Record<string, unknown>
    if ((typeof item.id !== 'string' && typeof item.id !== 'number') || (typeof item.id === 'string' && item.id.trim() === '')) {
      errors.push(`${prefix} must have a non-empty string or numeric id.`)
    } else if (ids.has(item.id)) {
      errors.push(`${prefix} has a duplicate id.`)
    } else {
      ids.add(item.id)
    }

    if (!isNonEmptyString(item.question)) errors.push(`${prefix} must have a question.`)
    if (!Array.isArray(item.options) || item.options.length !== 4 || !item.options.every(isNonEmptyString)) {
      errors.push(`${prefix} must have exactly four non-empty options.`)
    }
    const correctOption = item.correctOption
    if (typeof correctOption !== 'number' || !Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
      errors.push(`${prefix} must have a correctOption between 0 and 3.`)
    }
    if (!isNonEmptyString(item.explanation)) errors.push(`${prefix} must have an explanation.`)
  })

  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}

const validation = validateQuestions(rawQuestions)
if (!validation.valid) {
  throw new Error(`Invalid questions data: ${validation.errors.join(' ')}`)
}

export const questions = rawQuestions as Question[]

export function getQuestions(): readonly Question[] {
  return questions
}
