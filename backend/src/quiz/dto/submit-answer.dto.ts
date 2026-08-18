/** Request body for POST /api/submit. */
export type SubmitAnswerDto = {
  questionId: string;
  selectedOptionId: string;
  secondChoiceOptionId?: string | null;
  eliminatedOptionIds?: string[];
};
