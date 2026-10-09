import type { Rating } from "./types";

interface SRSState {
  interval_days: number;
  ease_factor: number;
  repetitions: number;
}

/**
 * SM-2 spaced repetition algorithm.
 * Returns updated state + next review date.
 */
export function calculateNextReview(
  state: SRSState,
  rating: Rating
): { interval_days: number; ease_factor: number; repetitions: number; next_review: string } {
  let { interval_days, ease_factor, repetitions } = state;

  const qualityMap: Record<Rating, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  };
  const q = qualityMap[rating];

  if (q < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  const next = new Date();
  next.setDate(next.getDate() + interval_days);
  const next_review = next.toISOString().split("T")[0];

  return { interval_days, ease_factor, repetitions, next_review };
}
