import { calculateAnswerScore, QUESTION_TIME_SECONDS } from './scoring';

export type GamePhase = 'start' | 'question' | 'feedback' | 'results';

export interface AnswerRecord {
  questionIndex: number;
  selectedOption: number | null;
  correct: boolean;
  timedOut: boolean;
  points: number;
}

export interface GameState {
  phase: GamePhase;
  questionIndex: number;
  questionCount: number;
  timeRemaining: number;
  score: number;
  correctAnswers: number;
  answers: AnswerRecord[];
  selectedOption: number | null;
  correctOption: number | null;
}

export function createInitialGameState(questionCount: number): GameState {
  return {
    phase: 'start',
    questionIndex: 0,
    questionCount: Math.max(0, questionCount),
    timeRemaining: QUESTION_TIME_SECONDS,
    score: 0,
    correctAnswers: 0,
    answers: [],
    selectedOption: null,
    correctOption: null,
  };
}

export function startGame(state: GameState): GameState {
  if (state.questionCount === 0) return { ...state, phase: 'results' };
  return {
    ...state,
    phase: 'question',
    questionIndex: 0,
    timeRemaining: QUESTION_TIME_SECONDS,
    selectedOption: null,
    correctOption: null,
  };
}

export function tick(state: GameState, seconds = 1): GameState {
  if (state.phase !== 'question') return state;
  return { ...state, timeRemaining: Math.max(0, state.timeRemaining - Math.max(0, seconds)) };
}

export function answerQuestion(
  state: GameState,
  selectedOption: number,
  correctOption: number,
): GameState {
  if (state.phase !== 'question') return state;

  const correct = selectedOption === correctOption;
  const points = calculateAnswerScore(selectedOption, correctOption, state.timeRemaining);
  const answer: AnswerRecord = {
    questionIndex: state.questionIndex,
    selectedOption,
    correct,
    timedOut: false,
    points,
  };

  return {
    ...state,
    phase: 'feedback',
    score: state.score + points,
    correctAnswers: state.correctAnswers + (correct ? 1 : 0),
    answers: [...state.answers, answer],
    selectedOption,
    correctOption,
  };
}

export function timeoutQuestion(state: GameState, correctOption: number): GameState {
  if (state.phase !== 'question') return state;
  const answer: AnswerRecord = {
    questionIndex: state.questionIndex,
    selectedOption: null,
    correct: false,
    timedOut: true,
    points: 0,
  };

  return {
    ...state,
    phase: 'feedback',
    answers: [...state.answers, answer],
    selectedOption: null,
    correctOption,
    timeRemaining: 0,
  };
}

export function advanceToNextQuestion(state: GameState): GameState {
  if (state.phase !== 'feedback') return state;
  const nextIndex = state.questionIndex + 1;
  if (nextIndex >= state.questionCount) {
    return { ...state, phase: 'results', selectedOption: null, correctOption: null };
  }

  return {
    ...state,
    phase: 'question',
    questionIndex: nextIndex,
    timeRemaining: QUESTION_TIME_SECONDS,
    selectedOption: null,
    correctOption: null,
  };
}

export const selectAnswer = answerQuestion;
export const advanceGame = advanceToNextQuestion;
