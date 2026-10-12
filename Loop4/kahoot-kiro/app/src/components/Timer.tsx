import styles from './Timer.module.css'

export interface TimerProps {
  timeRemaining: number
  maxTime?: number
  onTimeout?: () => void
}

export function Timer({ timeRemaining, maxTime = 15 }: TimerProps) {
  const seconds = Math.max(0, Math.ceil(timeRemaining))
  const ratio = Math.min(1, Math.max(0, seconds / maxTime))
  const status = seconds < 5 ? 'critical' : seconds <= 10 ? 'warning' : 'safe'

  return (
    <div className={`${styles.timer} ${styles[status]}`} role="timer" aria-label={`${seconds} segundos restantes`}>
      <div className={styles.timerHeader}>
        <span>Tiempo</span>
        <strong aria-live="polite">{seconds}s</strong>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.progress} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}

export default Timer
