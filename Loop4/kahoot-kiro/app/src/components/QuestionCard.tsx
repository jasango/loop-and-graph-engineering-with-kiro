import type { Question } from '../data/questions'
import styles from './QuestionCard.module.css'

export interface QuestionCardProps {
  question: Question
  selectedOption?: number | null
  correctOption?: number | null
  disabled?: boolean
  onSelect: (optionIndex: number) => void
}

export function QuestionCard({ question, selectedOption = null, correctOption = null, disabled = false, onSelect }: QuestionCardProps) {
  const locked = disabled || selectedOption !== null

  return (
    <section className={styles.card} aria-labelledby="question-text">
      <h2 id="question-text">{question.question}</h2>
      <div className={styles.options} role="group" aria-label="Opciones de respuesta">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index
          const isCorrect = correctOption === index
          const className = [styles.option, isSelected ? styles.selected : '', correctOption !== null && isCorrect ? styles.correct : '', correctOption !== null && isSelected && !isCorrect ? styles.incorrect : ''].filter(Boolean).join(' ')
          return (
            <button
              className={className}
              disabled={locked}
              key={`${question.id}-${index}`}
              onClick={() => onSelect(index)}
              aria-pressed={isSelected}
              aria-label={`Opción ${index + 1}: ${option}`}
            >
              <span className={styles.marker} aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
              {correctOption !== null && isCorrect && <span className={styles.badge}>Correcta</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default QuestionCard
