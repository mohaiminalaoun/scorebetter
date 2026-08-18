export type Option = {
  id: string;
  text: string;
};

export type ReadingWritingDomain =
  | 'Information and Ideas'
  | 'Craft and Structure'
  | 'Expression of Ideas'
  | 'Standard English Conventions';

export type OptionClassification =
  | 'correct'
  | 'primary-trap'
  | 'secondary-distractor'
  | 'weak-distractor';

export type OptionAnalysis = {
  optionId: string;
  rank: 1 | 2 | 3 | 4;
  classification: OptionClassification;
  rationale: string;
  likelyReasoning: string;
};

export type QuestionSource = {
  publisher: 'College Board';
  documentTitle: string;
  url: string;
  questionNumber: string;
};

export type Question = {
  id: string;
  prompt: string;
  passage?: string;
  options: Option[];
  domain: ReadingWritingDomain;
  skill: string;
  source: QuestionSource;
  /** Our authored best-to-worst diagnostic ranking, not a College Board ranking. */
  optionRanking: [string, string, string, string];
  optionAnalysis: [OptionAnalysis, OptionAnalysis, OptionAnalysis, OptionAnalysis];
};
