import type { Question } from './question.model';

// Hardcoded for now. This is the only file that changes when a database
// is introduced — the exported shapes stay the same.
const QUESTIONS: Question[] = [
  {
    id: 'q1',
    passage:
      'Although the museum had acquired the painting decades earlier, curators ___ its origins until a recent chemical analysis of the pigments finally settled the debate.',
    prompt:
      'Which choice completes the text with the most logical and precise word or phrase?',
    options: [
      { id: 'A', text: 'disputed' },
      { id: 'B', text: 'confirmed' },
      { id: 'C', text: 'ignored' },
      { id: 'D', text: 'restored' },
    ],
    correctOptionId: 'A',
  },
];

export function findQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getFirstQuestion(): Question {
  return QUESTIONS[0];
}
