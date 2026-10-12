import type { Question } from '../data/questions'
import styles from './Feedback.module.css'

export interface FeedbackProps {
  question: Question
  selectedOption?: number | null
  correctOption?: number
  timedOut?: boolean
}

export function Feedback({ question, selectedOption = null, correctOption = question.correctOption, timedOut = false }: FeedbackProps) {
  const answeredCorrectly = selectedOption === correctOption && !timedOut
  const title = timedOut ? '¡Se acabó el tiempo!' : answeredCorrectly ? '¡Respuesta correcta!' : 'Respuesta incorrecta'
  return (
    <aside className={`${styles.feedback} ${answeredCorrectly ? styles.success : styles.error}`} role="status" aria-live="polite">
      <h3>{title}</h3>
      <p><strong>Respuesta correcta:</strong> {question.options[correctOption]}</p>
      <p>{question.explanation}</p>
    </aside>
  )
}

export default Feedback
