import type {
  ComparisonOption,
  ComparisonSide,
  DiagnosticLabel,
} from '../diagnostic-classifier';

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
  /** Analysis for every option, keyed by role, for the comparison panel. */
  optionAnalyses: ComparisonSide[];
  /** Button set for the comparison row, generated per diagnostic label. */
  availableComparisons: ComparisonOption[];
};
