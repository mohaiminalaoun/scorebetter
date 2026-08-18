/** Response body for POST /api/submit. */
export type SubmitAnswerResultDto = {
  correct: boolean;
  correctOptionId: string;
  selectedOptionId: string;
  secondChoiceWasCorrect: boolean;
};
