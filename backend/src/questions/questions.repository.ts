import type { Question } from './question.model';
import { SAT_READING_WRITING_QUESTIONS } from './sat-reading-writing.questions';

// This in-memory collection is the repository's current data source. A future
// database adapter can replace it without changing callers of this module.
const QUESTIONS: Question[] = SAT_READING_WRITING_QUESTIONS;

export function findQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getFirstQuestion(): Question {
  return QUESTIONS[0];
}

export function getAllQuestions(): Question[] {
  return QUESTIONS;
}
