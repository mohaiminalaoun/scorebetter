import type { Question } from '../../questions/question.model';

/**
 * Response body for GET /api/question — the question as the client may see it,
 * with the correct answer stripped out.
 */
export type PublicQuestionDto = Omit<Question, 'correctOptionId'>;
