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

export type SubmitResult = {
  correct: boolean;
  correctOptionId: string;
  selectedOptionId: string;
  secondChoiceWasCorrect: boolean;
};

export type SubmitAnswerPayload = {
  questionId: string;
  selectedOptionId: string;
  secondChoiceOptionId: string | null;
  eliminatedOptionIds: string[];
};
