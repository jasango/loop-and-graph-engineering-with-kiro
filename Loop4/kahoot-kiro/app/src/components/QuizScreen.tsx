import type { Question } from '../data/questions'
import { Feedback } from './Feedback'
import { QuestionCard } from './QuestionCard'
import { Timer } from './Timer'
import styles from './QuizScreen.module.css'

export interface QuizScreenProps {
  question: Question
  questionIndex: number
  questionCount: number
  timeRemaining: number
  selectedOption?: number | null
  correctOption?: number | null
  onSelect: (optionIndex: number) => void
  onTimeout?: () => void
  showFeedback?: boolean
  timedOut?: boolean
}

export function QuizScreen({ question, questionIndex, questionCount, timeRemaining, selectedOption = null, correctOption = null, onSelect, showFeedback = correctOption !== null, timedOut = false }: QuizScreenProps) {
  return (
    <main className={styles.screen} aria-label="Partida de preguntas">
      <header className={styles.header}>
        <p className={styles.progress}>Pregunta {questionIndex + 1} de {questionCount}</p>
        <Timer timeRemaining={timeRemaining} />
      </header>
      <QuestionCard question={question} selectedOption={selectedOption} correctOption={showFeedback ? correctOption : null} disabled={showFeedback} onSelect={onSelect} />
      {showFeedback && <Feedback question={question} selectedOption={selectedOption} correctOption={correctOption ?? question.correctOption} timedOut={timedOut} />}
    </main>
  )
}

export default QuizScreen
