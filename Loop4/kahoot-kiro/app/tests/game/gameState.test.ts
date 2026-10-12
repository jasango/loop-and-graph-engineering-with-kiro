import { describe, expect, it } from 'vitest';
import {
  advanceToNextQuestion,
  answerQuestion,
  createInitialGameState,
  startGame,
  tick,
  timeoutQuestion,
} from '../../src/game/gameState';

describe('game state', () => {
  it('starts at the first question with a full timer', () => {
    const state = startGame(createInitialGameState(20));
    expect(state.phase).toBe('question');
    expect(state.questionIndex).toBe(0);
    expect(state.timeRemaining).toBe(15);
  });

  it('counts a correct answer and locks it in feedback', () => {
    const state = answerQuestion(startGame(createInitialGameState(2)), 2, 2);
    expect(state.phase).toBe('feedback');
    expect(state.correctAnswers).toBe(1);
    expect(state.score).toBe(1000);
    expect(state.answers[0]).toMatchObject({ selectedOption: 2, correct: true, points: 1000 });
    expect(answerQuestion(state, 1, 2)).toBe(state);
  });

  it('records incorrect answers without points', () => {
    const started = tick(startGame(createInitialGameState(2)), 4);
    const state = answerQuestion(started, 0, 1);
    expect(state.correctAnswers).toBe(0);
    expect(state.score).toBe(0);
    expect(state.answers[0].points).toBe(0);
  });

  it('records timeout as unanswered and reveals the correct option', () => {
    const state = timeoutQuestion(startGame(createInitialGameState(2)), 3);
    expect(state.phase).toBe('feedback');
    expect(state.timeRemaining).toBe(0);
    expect(state.answers[0]).toMatchObject({ selectedOption: null, timedOut: true, points: 0 });
    expect(state.correctOption).toBe(3);
  });

  it('resets the timer on advance and reaches results after the final question', () => {
    const first = answerQuestion(startGame(createInitialGameState(2)), 0, 1);
    const second = advanceToNextQuestion(first);
    expect(second).toMatchObject({ phase: 'question', questionIndex: 1, timeRemaining: 15 });
    const finished = advanceToNextQuestion(answerQuestion(second, 1, 1));
    expect(finished.phase).toBe('results');
    expect(finished.score).toBe(1000);
  });

  it('does not tick outside the active question phase', () => {
    const state = createInitialGameState(1);
    expect(tick(state, 2)).toBe(state);
  });
});
