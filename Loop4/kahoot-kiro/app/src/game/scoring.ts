export const QUESTION_TIME_SECONDS = 15;
export const MIN_SCORE = 500;
export const MAX_SCORE = 1000;

/** Calculates points for a correct answer using the time available at selection. */
export function calculateScore(
  isCorrect: boolean,
  timeRemaining: number,
  questionTime = QUESTION_TIME_SECONDS,
): number {
  if (!isCorrect) return 0;

  const safeQuestionTime = Math.max(1, questionTime);
  const safeTime = Math.min(safeQuestionTime, Math.max(0, timeRemaining));
  const score = Math.round(MIN_SCORE + (MAX_SCORE - MIN_SCORE) * (safeTime / safeQuestionTime));
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
}

export function calculateAnswerScore(
  selectedOption: number,
  correctOption: number,
  timeRemaining: number,
  questionTime = QUESTION_TIME_SECONDS,
): number {
  return calculateScore(selectedOption === correctOption, timeRemaining, questionTime);
}
