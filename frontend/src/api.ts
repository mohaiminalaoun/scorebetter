import type { Question, SubmitAnswerPayload, SubmitResult } from './types';

function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (!raw) return '/api';
  const trimmed = raw.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const BASE_URL = apiBase();

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
