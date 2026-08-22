import type { DiagnosticLabel } from '../diagnostic-classifier';

/** Response body for POST /api/submit. */
export type SubmitAnswerResultDto = {
  correct: boolean;
  correctOptionId: string;
  selectedOptionId: string;
  secondChoiceWasCorrect: boolean;
  label: DiagnosticLabel;
  explanation: string;
};
