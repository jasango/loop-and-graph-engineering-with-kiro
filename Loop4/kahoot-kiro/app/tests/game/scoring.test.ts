import { describe, expect, it } from 'vitest';
import { calculateAnswerScore, calculateScore } from '../../src/game/scoring';

describe('scoring', () => {
  it('awards the maximum score with all time remaining', () => {
    expect(calculateScore(true, 15)).toBe(1000);
  });

  it('awards the minimum score when no time remains for a correct answer', () => {
    expect(calculateScore(true, 0)).toBe(500);
  });

  it('rounds scores and clamps time outside the valid range', () => {
    expect(calculateScore(true, 7.5)).toBe(750);
    expect(calculateScore(true, 30)).toBe(1000);
    expect(calculateScore(true, -2)).toBe(500);
  });

  it('awards zero for incorrect answers', () => {
    expect(calculateAnswerScore(1, 0, 15)).toBe(0);
  });
});
