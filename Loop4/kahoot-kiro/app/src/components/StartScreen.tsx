import styles from './StartScreen.module.css'

export interface StartScreenProps {
  onStart: () => void
  questionCount?: number
}

export function StartScreen({ onStart, questionCount = 20 }: StartScreenProps) {
  return (
    <main className={styles.screen} aria-labelledby="start-title">
      <section className={styles.card}>
        <div className={styles.logo} aria-hidden="true">K!</div>
        <p className={styles.eyebrow}>Kiro learning challenge</p>
        <h1 id="start-title">Kahoot! de Kiro</h1>
        <p className={styles.intro}>
          Pon a prueba tus conocimientos sobre Kiro con una partida rápida y divertida.
        </p>
        <div className={styles.details} aria-label="Detalles de la partida">
          <span>{questionCount} preguntas</span>
          <span>15 s por pregunta</span>
        </div>
        <button className={styles.primaryButton} type="button" onClick={onStart}>
          Comenzar
          <span aria-hidden="true">→</span>
        </button>
        <p className={styles.hint}>Responde rápido para conseguir más puntos.</p>
      </section>
    </main>
  )
}

export default StartScreen
