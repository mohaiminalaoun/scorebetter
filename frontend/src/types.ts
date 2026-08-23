export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  prompt: string;
  passage?: string;
  options: Option[];
};

/** How the user has marked a single option. */
export type Mark = 'selected' | 'maybe' | 'eliminated';

/** optionId -> mark. Options with no entry are unmarked. */
export type Marks = Record<string, Mark>;

export type DiagnosticLabel =
  | 'crystal-clear'
  | 'some-confusion'
  | 'confused-sensed-truth'
  | 'fooled-dismissed-truth'
  | 'fooled-blind-spot'
  | 'blind-spot-on-correct'
  | 'dismissed-truth-entirely'
  | 'doubted-truth'
  | 'lost';

export type OptionClassification =
  | 'correct'
  | 'primary-trap'
  | 'secondary-distractor'
  | 'weak-distractor';

export type ComparisonRole =
  | 'correct'
  | 'trap'
  | 'selected'
  | 'second-choice'
  | 'eliminated'
  | 'other';

export type ComparisonSide = {
  optionId: string;
  optionText: string;
  rationale: string;
  likelyReasoning: string;
  classification: OptionClassification;
  role: ComparisonRole;
};

export type ComparisonFraming = 'standard' | 'eliminated' | 'reinforcement';

export type ComparisonOption = {
  id: string;
  buttonLabel: string;
  optionIdA: string;
  optionIdB: string;
  framing: ComparisonFraming;
};

export type SubmitResult = {
  correct: boolean;
  correctOptionId: string;
  trapOptionId: string;
  selectedOptionId: string;
  secondChoiceWasCorrect: boolean;
  label: DiagnosticLabel;
  explanation: string[];
  trapExplanation: {
    optionId: string;
    whyTempting: string;
    whyWrong: string;
  };
  optionAnalyses: ComparisonSide[];
  availableComparisons: ComparisonOption[];
};

export type SubmitAnswerPayload = {
  questionId: string;
  selectedOptionId: string;
  secondChoiceOptionId: string | null;
  eliminatedOptionIds: string[];
};
