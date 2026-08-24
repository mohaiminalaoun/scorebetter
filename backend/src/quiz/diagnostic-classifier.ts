import type {
  GradableQuestion,
  OptionClassification,
} from '../questions/question.model';

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

/** A single option's authored analysis, shaped for display. */
export type OptionAnalysisView = {
  optionId: string;
  optionText: string;
  rationale: string;
  likelyReasoning: string;
  classification: OptionClassification;
};

/** How an option relates to the student's marks, for comparison-panel display. */
export type ComparisonRole =
  | 'correct'
  | 'trap'
  | 'selected'
  | 'second-choice'
  | 'eliminated'
  | 'other';

export type ComparisonSide = OptionAnalysisView & { role: ComparisonRole };

export type ComparisonFraming = 'standard' | 'eliminated' | 'reinforcement';

/** One button in the result screen's comparison row. */
export type ComparisonOption = {
  id: string;
  buttonLabel: string;
  /** The student's side of the comparison (usually their pick). */
  optionIdA: string;
  /** The counterpart being compared against (usually the correct answer or the trap). */
  optionIdB: string;
  framing: ComparisonFraming;
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
  optionRanking: GradableQuestion['optionRanking'],
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

/** Thin wrapper around the authored option analysis, shaped for display. */
export function getOptionAnalysisFor(
  question: GradableQuestion,
  optionId: string,
): OptionAnalysisView {
  const analysis = question.optionAnalysis.find((a) => a.optionId === optionId);
  if (!analysis) {
    throw new Error(`Incomplete option analysis for question: ${question.id}`);
  }
  const option = question.options.find((o) => o.id === optionId);
  if (!option) {
    throw new Error(`Unknown option ${optionId} for question: ${question.id}`);
  }
  return {
    optionId: analysis.optionId,
    optionText: option.text,
    rationale: analysis.rationale,
    likelyReasoning: analysis.likelyReasoning,
    classification: analysis.classification,
  };
}

function comparisonRoleFor(
  question: GradableQuestion,
  marks: Marks,
  optionId: string,
): ComparisonRole {
  const [correctOptionId, trapOptionId] = question.optionRanking;
  if (optionId === correctOptionId) return 'correct';
  if (optionId === trapOptionId) return 'trap';
  if (optionId === marks.selectedOptionId) return 'selected';
  if (marks.secondChoiceOptionId && optionId === marks.secondChoiceOptionId) {
    return 'second-choice';
  }
  if ((marks.eliminatedOptionIds ?? []).includes(optionId)) return 'eliminated';
  return 'other';
}

/** One option's analysis plus its role relative to the student's marks. */
export function getComparisonSide(
  question: GradableQuestion,
  marks: Marks,
  optionId: string,
): ComparisonSide {
  return {
    ...getOptionAnalysisFor(question, optionId),
    role: comparisonRoleFor(question, marks, optionId),
  };
}

/** Both sides of an arbitrary option pair, so the frontend can request any comparison. */
export function getComparison(
  question: GradableQuestion,
  marks: Marks,
  optionIdA: string,
  optionIdB: string,
): { a: ComparisonSide; b: ComparisonSide } {
  return {
    a: getComparisonSide(question, marks, optionIdA),
    b: getComparisonSide(question, marks, optionIdB),
  };
}

/**
 * Draft student-facing copy for comparison buttons whose framing needs more than a
 * generic "compare X vs Y" label. NEEDS COPY REVIEW before shipping — placeholders only.
 */
const DRAFT_FRAMING_COPY = {
  fooledDismissedTruthEliminated:
    'See why you crossed out the right answer',
  dismissedTruthEntirelyEliminated:
    'See why you crossed out the right answer',
  crystalClearReinforcement:
    'Curious why the trap almost got you? Compare it to your answer',
};

/**
 * Per-label comparison button spec (source of truth for getAvailableComparisons):
 *
 * | Label                     | Buttons | Pairs (A = student's side, B = counterpart)         | Framing       |
 * |----------------------------|---------|-------------------------------------------------------|---------------|
 * | crystal-clear              | 1       | selected(=correct) vs trap                             | reinforcement |
 * | some-confusion              | 1       | selected(=correct) vs trap                             | standard      |
 * | confused-sensed-truth       | 1       | selected(=trap) vs correct(=second choice)             | standard      |
 * | fooled-dismissed-truth      | 1       | selected(=trap) vs correct(eliminated)                 | eliminated    |
 * | fooled-blind-spot           | 1       | selected(=trap) vs correct                             | standard      |
 * | blind-spot-on-correct       | 2       | selected vs correct; selected vs trap(=second choice)  | standard      |
 * | dismissed-truth-entirely    | 2       | selected vs correct(eliminated); selected vs trap      | eliminated + standard |
 * | doubted-truth               | 1       | selected vs correct(=second choice)                    | standard      |
 * | lost                        | 1       | selected vs correct                                    | standard      |
 */
export function getAvailableComparisons(
  label: DiagnosticLabel,
  question: GradableQuestion,
  marks: Marks,
): ComparisonOption[] {
  const [correctOptionId, trapOptionId] = question.optionRanking;
  const selectedOptionId = marks.selectedOptionId;

  const standard = (
    id: string,
    optionIdA: string,
    optionIdB: string,
    buttonLabel: string,
  ): ComparisonOption => ({ id, buttonLabel, optionIdA, optionIdB, framing: 'standard' });

  switch (label) {
    case 'crystal-clear':
      return [
        {
          id: 'selected-vs-trap',
          buttonLabel: DRAFT_FRAMING_COPY.crystalClearReinforcement,
          optionIdA: selectedOptionId,
          optionIdB: trapOptionId,
          framing: 'reinforcement',
        },
      ];

    case 'some-confusion':
      return [
        standard(
          'selected-vs-trap',
          selectedOptionId,
          trapOptionId,
          'Compare your answer to the trap',
        ),
      ];

    case 'confused-sensed-truth':
    case 'fooled-blind-spot':
      return [
        standard(
          'selected-vs-correct',
          selectedOptionId,
          correctOptionId,
          'Compare your pick to the correct answer',
        ),
      ];

    case 'fooled-dismissed-truth':
      return [
        {
          id: 'selected-vs-eliminated-correct',
          buttonLabel: DRAFT_FRAMING_COPY.fooledDismissedTruthEliminated,
          optionIdA: selectedOptionId,
          optionIdB: correctOptionId,
          framing: 'eliminated',
        },
      ];

    case 'blind-spot-on-correct':
      return [
        standard(
          'selected-vs-correct',
          selectedOptionId,
          correctOptionId,
          'Compare your pick to the correct answer',
        ),
        standard(
          'selected-vs-trap',
          selectedOptionId,
          trapOptionId,
          'Compare your pick to the trap you flagged',
        ),
      ];

    case 'dismissed-truth-entirely':
      return [
        {
          id: 'selected-vs-eliminated-correct',
          buttonLabel: DRAFT_FRAMING_COPY.dismissedTruthEntirelyEliminated,
          optionIdA: selectedOptionId,
          optionIdB: correctOptionId,
          framing: 'eliminated',
        },
        standard(
          'selected-vs-trap',
          selectedOptionId,
          trapOptionId,
          'Compare your pick to the trap you flagged',
        ),
      ];

    case 'doubted-truth':
      return [
        standard(
          'selected-vs-correct',
          selectedOptionId,
          correctOptionId,
          'Compare your pick to the correct answer (your second choice)',
        ),
      ];

    case 'lost':
      return [
        standard(
          'selected-vs-correct',
          selectedOptionId,
          correctOptionId,
          'Compare your pick to the correct answer',
        ),
      ];

    default: {
      const exhaustive: never = label;
      throw new Error(`Unhandled diagnostic label: ${exhaustive as string}`);
    }
  }
}

export function buildDiagnosticExplanation(
  label: DiagnosticLabel,
  question: GradableQuestion,
  marks: Marks,
): string[] {
  const correctOptionId = question.optionRanking[0];
  const correctAnalysis = getOptionAnalysisFor(question, correctOptionId);

  const parts = [
    DIAGNOSTIC_SUMMARIES[label],
    `Correct-answer reasoning (${correctAnalysis.optionId}): ${correctAnalysis.rationale}`,
  ];

  const selectedOptionId = marks.selectedOptionId;
  if (selectedOptionId !== correctOptionId) {
    const selectedAnalysis = getOptionAnalysisFor(question, selectedOptionId);
    const heading =
      WRONG_OPTION_ANALYSIS_HEADINGS[
        selectedAnalysis.classification as Exclude<OptionClassification, 'correct'>
      ];
    parts.push(`${heading} (${selectedAnalysis.optionId}): ${selectedAnalysis.rationale}`);
  }

  return parts;
}
