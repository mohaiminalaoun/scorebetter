import type { Question, SubmitAnswerPayload, SubmitResult } from './types';

const BASE_URL = '/api';

export async function fetchQuestion(): Promise<Question> {
  const res = await fetch(`${BASE_URL}/question`);
  if (!res.ok) {
    throw new Error(`Failed to load question (${res.status})`);
  }
  return res.json();
}

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch(`${BASE_URL}/questions`);
  if (!res.ok) {
    throw new Error(`Failed to load questions (${res.status})`);
  }
  return res.json();
}

export async function submitAnswer(payload: SubmitAnswerPayload): Promise<SubmitResult> {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit answer (${res.status})`);
  }
  return res.json();
}
