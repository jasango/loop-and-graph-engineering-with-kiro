import styles from './ResultsScreen.module.css'

export interface ResultsScreenProps {
  score: number
  correctAnswers: number
  totalQuestions: number
  onRestart: () => void
}

export function ResultsScreen({ score, correctAnswers, totalQuestions, onRestart }: ResultsScreenProps) {
  const percentage = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0

  return (
    <main className={styles.screen} aria-labelledby="results-title">
      <section className={styles.card}>
        <div className={styles.trophy} aria-hidden="true">★</div>
        <p className={styles.eyebrow}>Partida completada</p>
        <h1 id="results-title">¡Buen trabajo!</h1>
        <p className={styles.summary}>Este es el resumen de tu partida.</p>
        <div className={styles.scoreBlock} aria-label={`Puntuación: ${score} puntos`}>
          <span className={styles.scoreLabel}>Puntuación</span>
          <strong>{score}</strong>
          <span className={styles.points}>puntos</span>
        </div>
        <dl className={styles.metrics}>
          <div><dt>Aciertos</dt><dd>{correctAnswers} / {totalQuestions}</dd></div>
          <div><dt>Porcentaje</dt><dd>{percentage}%</dd></div>
        </dl>
        <button className={styles.primaryButton} type="button" onClick={onRestart}>
          Jugar de nuevo
          <span aria-hidden="true">↻</span>
        </button>
      </section>
    </main>
  )
}

export default ResultsScreen
