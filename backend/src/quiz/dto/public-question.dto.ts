import type { Question } from '../../questions/question.model';

/**
 * Response body for GET /api/question — the question as the client may see it,
 * with all answer and authoring metadata stripped out.
 */
export type PublicQuestionDto = Omit<
  Question,
  'optionRanking' | 'optionAnalysis' | 'source'
>;
