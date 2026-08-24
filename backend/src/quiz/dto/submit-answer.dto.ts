import type { GradableQuestion } from '../../questions/question.model';

export type AuthoredQuestionDto = GradableQuestion;

/** Request body for POST /api/submit. */
export type SubmitAnswerDto = {
  questionId: string;
  selectedOptionId: string;
  secondChoiceOptionId?: string | null;
  eliminatedOptionIds?: string[];
  /** Optional full question object for client-provided questions (e.g., uploaded JSON).
   * Only used if the question is not found in the server bank. */
  authoredQuestion?: AuthoredQuestionDto;
};
