import { useEffect, useState } from 'react'
import { questions } from './data/questions'
import {
  advanceToNextQuestion,
  answerQuestion,
  createInitialGameState,
  startGame,
  tick,
  timeoutQuestion,
  type GameState,
} from './game/gameState'
import { QuizScreen } from './components/QuizScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { StartScreen } from './components/StartScreen'

const FEEDBACK_DURATION_MS = 2000
const TICK_INTERVAL_MS = 1000

export function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(questions.length))

  useEffect(() => {
    if (gameState.phase !== 'question') return

    if (gameState.timeRemaining <= 0) {
      setGameState((current) => {
        if (current.phase !== 'question' || current.timeRemaining > 0) return current
        return timeoutQuestion(current, questions[current.questionIndex].correctOption)
      })
      return
    }

    const timer = window.setInterval(() => {
      setGameState((current) => tick(current, 1))
    }, TICK_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [gameState.phase, gameState.questionIndex, gameState.timeRemaining])

  useEffect(() => {
    if (gameState.phase !== 'feedback') return

    const timer = window.setTimeout(() => {
      setGameState((current) => advanceToNextQuestion(current))
    }, FEEDBACK_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [gameState.phase, gameState.questionIndex])

  const beginGame = () => setGameState((current) => startGame(current))
  const restartGame = () => setGameState(createInitialGameState(questions.length))

  if (gameState.phase === 'start') {
    return <StartScreen questionCount={questions.length} onStart={beginGame} />
  }

  if (gameState.phase === 'results') {
    return (
      <ResultsScreen
        score={gameState.score}
        correctAnswers={gameState.correctAnswers}
        totalQuestions={gameState.questionCount}
        onRestart={restartGame}
      />
    )
  }

  const question = questions[gameState.questionIndex]
  const latestAnswer = gameState.answers[gameState.answers.length - 1]
  const showingFeedback = gameState.phase === 'feedback'

  return (
    <QuizScreen
      question={question}
      questionIndex={gameState.questionIndex}
      questionCount={gameState.questionCount}
      timeRemaining={gameState.timeRemaining}
      selectedOption={gameState.selectedOption}
      correctOption={gameState.correctOption}
      showFeedback={showingFeedback}
      timedOut={showingFeedback && latestAnswer?.timedOut === true}
      onSelect={(optionIndex) => {
        setGameState((current) => answerQuestion(current, optionIndex, question.correctOption))
      }}
    />
  )
}

export default App
