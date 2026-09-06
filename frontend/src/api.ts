import type { Question, SubmitAnswerPayload, SubmitResult } from './types';

function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (!raw) return '/api';
  const trimmed = raw.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const BASE_URL = apiBase();

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

// credentials keeps the session cookie attached even if VITE_API_URL ever
// points at a different origin than the app.
async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, { credentials: 'include', ...init });
}

export async function fetchQuestion(): Promise<Question> {
  const res = await request('/question');
  if (!res.ok) {
    throw new ApiError(`Failed to load question (${res.status})`, res.status);
  }
  return res.json();
}

export async function fetchQuestions(): Promise<Question[]> {
  const res = await request('/questions');
  if (!res.ok) {
    throw new ApiError(`Failed to load questions (${res.status})`, res.status);
  }
  return res.json();
}

export async function submitAnswer(payload: SubmitAnswerPayload): Promise<SubmitResult> {
  const res = await request('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new ApiError(`Failed to submit answer (${res.status})`, res.status);
  }
  return res.json();
}

// Not being signed in is a normal state, not an error, so this returns null
// rather than throwing on 401.
export async function fetchMe(): Promise<{ email: string } | null> {
  const res = await request('/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError(`Failed to check session (${res.status})`, res.status);
  return res.json();
}

export async function requestMagicLink(email: string): Promise<void> {
  const res = await request('/auth/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new ApiError(`Could not send the link (${res.status})`, res.status);
  }
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}
