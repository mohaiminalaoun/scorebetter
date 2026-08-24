import type { AuthoredQuestion, Question } from './types';
import { validateAuthoredQuestion } from '../../backend/src/questions/authored-question-validation';

const STORAGE_KEY = 'scorebetter-imported-questions';

export type FullQuestion = AuthoredQuestion;

export type ImportedQuestionLoadResult = {
  questions: FullQuestion[];
  warning: string | null;
};

/** Parse and validate either a raw question array or an object containing one. */
export function parseImportedJSON(json: unknown): FullQuestion[] {
  if (json === null || json === undefined) {
    throw new Error('File is empty');
  }

  let items: unknown[];
  if (Array.isArray(json)) {
    items = json;
  } else if (typeof json === 'object' && 'questions' in json) {
    const questions = (json as Record<string, unknown>).questions;
    if (!Array.isArray(questions)) {
      throw new Error('Field "questions" must be an array');
    }
    items = questions;
  } else {
    throw new Error(
      'Import must be an array or an object with a "questions" array',
    );
  }

  if (items.length === 0) {
    throw new Error('No questions found in import');
  }

  const validated = items.map((item, index) => {
    try {
      return validateQuestion(item);
    } catch (error) {
      throw new Error(`Question ${index + 1}: ${(error as Error).message}`);
    }
  });

  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const question of validated) {
    if (seenIds.has(question.id)) duplicateIds.add(question.id);
    seenIds.add(question.id);
  }
  if (duplicateIds.size > 0) {
    throw new Error(
      `Duplicate question IDs: ${[...duplicateIds].sort().join(', ')}`,
    );
  }

  return validated;
}

function validateQuestion(question: unknown): FullQuestion {
  return validateAuthoredQuestion(question) as FullQuestion;
}

export function findQuestionIdConflicts(
  importedQuestions: FullQuestion[],
  bankQuestions: Question[],
): string[] {
  const bankIds = new Set(bankQuestions.map((question) => question.id));
  return importedQuestions
    .map((question) => question.id)
    .filter((id) => bankIds.has(id))
    .sort();
}

export function saveImportedQuestions(questions: FullQuestion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

/** Restore and revalidate saved imports, removing stale or malformed data. */
export function loadImportedQuestions(): ImportedQuestionLoadResult {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { questions: [], warning: null };

  try {
    return {
      questions: parseImportedJSON(JSON.parse(stored)),
      warning: null,
    };
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return {
      questions: [],
      warning: `Saved import was removed: ${(error as Error).message}`,
    };
  }
}

export function clearImportedQuestions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Strip grading metadata before adding an imported item to the quiz UI. */
export function toPublicQuestion(full: FullQuestion): Question {
  const { optionRanking, optionAnalysis, ...publicQuestion } = full;
  return publicQuestion;
}
