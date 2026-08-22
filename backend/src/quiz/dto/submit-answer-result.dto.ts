import type { DiagnosticLabel } from '../diagnostic-classifier';

export type TrapExplanation = {
  optionId: string;
  whyTempting: string;
  whyWrong: string;
};

/** Response body for POST /api/submit. */
export type SubmitAnswerResultDto = {
  correct: boolean;
  correctOptionId: string;
  trapOptionId: string;
  selectedOptionId: string;
  secondChoiceWasCorrect: boolean;
  label: DiagnosticLabel;
  explanation: string[];
  trapExplanation: TrapExplanation;
};
