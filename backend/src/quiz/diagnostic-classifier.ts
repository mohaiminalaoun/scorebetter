import type { OptionClassification, Question } from '../questions/question.model';

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

export type Marks = {
  selectedOptionId: string;
  secondChoiceOptionId?: string | null;
  eliminatedOptionIds?: string[];
};

const DIAGNOSTIC_SUMMARIES: Record<DiagnosticLabel, string> = {
  'crystal-clear':
    'You selected the correct answer and identified the strongest distractor as your second choice. This suggests clear reasoning and good awareness of the trap.',
  'some-confusion':
    'You selected the correct answer, but you did not identify the strongest distractor as your second choice. Your final answer was right, though the alternatives may need another look.',
  'confused-sensed-truth':
    'You kept the correct answer in consideration but ultimately chose the strongest distractor. You were close; focus on the exact difference between those two choices.',
  'fooled-dismissed-truth':
    'You chose the strongest distractor and actively eliminated the correct answer. This points to a specific misunderstanding worth reviewing carefully.',
  'fooled-blind-spot':
    'You chose the strongest distractor without considering the correct answer as a finalist. The trap matched part of the passage, but missed the question’s full requirement.',
  'blind-spot-on-correct':
    'You recognized the strongest distractor but never considered the correct answer as a finalist. Your elimination process had useful signal, but it overlooked the best-supported choice.',
  'dismissed-truth-entirely':
    'You recognized the strongest distractor but actively eliminated the correct answer before selecting a weaker choice. Revisit the evidence used to reject the correct answer.',
  'doubted-truth':
    'You kept the correct answer as your second choice but selected a weaker distractor instead. This suggests that your initial understanding was stronger than your final decision.',
  lost:
    'Neither your answer nor your second choice matched the correct answer or the strongest distractor. Rework the question from the beginning and identify exactly what it is asking.',
};

const WRONG_OPTION_ANALYSIS_HEADINGS: Record<
  Exclude<OptionClassification, 'correct'>,
  string
> = {
  'primary-trap': 'Primary-trap analysis',
  'secondary-distractor': 'Secondary-distractor analysis',
  'weak-distractor': "Why this doesn't hold up",
};

/**
 * Classifies a valid mark pattern relative to an authored option ranking.
 * optionRanking[0] is correct and optionRanking[1] is the primary trap.
 */
export function classifyMarks(
  marks: Marks,
  optionRanking: Question['optionRanking'],
): DiagnosticLabel {
  const [correctOptionId, trapOptionId] = optionRanking;
  const secondChoiceOptionId = marks.secondChoiceOptionId ?? null;
  const eliminatedOptionIds = new Set(marks.eliminatedOptionIds ?? []);

  if (marks.selectedOptionId === correctOptionId) {
    return secondChoiceOptionId === trapOptionId
      ? 'crystal-clear'
      : 'some-confusion';
  }

  if (marks.selectedOptionId === trapOptionId) {
    if (secondChoiceOptionId === correctOptionId) {
      return 'confused-sensed-truth';
    }

    return eliminatedOptionIds.has(correctOptionId)
      ? 'fooled-dismissed-truth'
      : 'fooled-blind-spot';
  }

  if (secondChoiceOptionId === correctOptionId) {
    return 'doubted-truth';
  }

  if (secondChoiceOptionId === trapOptionId) {
    return eliminatedOptionIds.has(correctOptionId)
      ? 'dismissed-truth-entirely'
      : 'blind-spot-on-correct';
  }

  return 'lost';
}

export function buildDiagnosticExplanation(
  label: DiagnosticLabel,
  question: Question,
  marks: Marks,
): string[] {
  const correctOptionId = question.optionRanking[0];
  const findAnalysis = (optionId: string) => {
    const analysis = question.optionAnalysis.find(
      (a) => a.optionId === optionId,
    );
    if (!analysis) {
      throw new Error(
        `Incomplete option analysis for question: ${question.id}`,
      );
    }
    return analysis;
  };

  const correctAnalysis = findAnalysis(correctOptionId);

  const parts = [
    DIAGNOSTIC_SUMMARIES[label],
    `Correct-answer reasoning (${correctAnalysis.optionId}): ${correctAnalysis.rationale}`,
  ];

  const selectedOptionId = marks.selectedOptionId;
  if (selectedOptionId !== correctOptionId) {
    const selectedAnalysis = findAnalysis(selectedOptionId);
    const heading =
      WRONG_OPTION_ANALYSIS_HEADINGS[
        selectedAnalysis.classification as Exclude<OptionClassification, 'correct'>
      ];
    parts.push(`${heading} (${selectedAnalysis.optionId}): ${selectedAnalysis.rationale}`);
  }

  return parts;
}
