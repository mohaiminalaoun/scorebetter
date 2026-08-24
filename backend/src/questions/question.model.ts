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

/**
 * Where a question came from. Official items carry College Board provenance;
 * original items are ScoreBetter-authored practice written to mirror SAT
 * structure. `authoredBy: 'ai-draft'` flags questions that still need human
 * review before their trap rankings are trusted.
 */
export type QuestionSource =
  | {
      publisher: 'College Board';
      documentTitle: string;
      url: string;
      questionNumber: string;
    }
  | {
      publisher: 'ScoreBetter';
      origin: 'original-practice';
      authoredBy: 'ai-draft' | 'human';
    };

export type GradableQuestion = {
  id: string;
  prompt: string;
  passage?: string;
  options: Option[];
  domain: ReadingWritingDomain;
  skill: string;
  /** Our authored best-to-worst diagnostic ranking, not a College Board ranking. */
  optionRanking: [string, string, string, string];
  optionAnalysis: [OptionAnalysis, OptionAnalysis, OptionAnalysis, OptionAnalysis];
};

export type Question = GradableQuestion & {
  source: QuestionSource;
};
