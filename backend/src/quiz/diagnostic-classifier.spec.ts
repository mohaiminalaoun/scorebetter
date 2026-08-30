import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validateAuthoredQuestion } from '../questions/authored-question-validation';
import {
  getAllQuestions,
  getFirstQuestion,
} from '../questions/questions.repository';
import { ORIGINAL_REPLACEMENT_CANDIDATES } from '../questions/sat-reading-writing.replacement-candidates';
import type {
  GradableQuestion,
  Question,
} from '../questions/question.model';
import {
  classifyMarks,
  getAvailableComparisons,
  getComparison,
  getOptionAnalysisFor,
  type DiagnosticLabel,
  type Marks,
} from './diagnostic-classifier';
import { QuizService } from './quiz.service';

const ranking: [string, string, string, string] = ['A', 'B', 'C', 'D'];

test('runtime bank contains only the nine approved ScoreBetter originals', () => {
  const questions = getAllQuestions();

  assert.equal(questions.length, 9);
  assert.equal(new Set(questions.map((question) => question.id)).size, 9);
  assert.ok(
    questions.every(
      (question) =>
        question.source.publisher === 'ScoreBetter' &&
        !question.id.startsWith('college-board-'),
    ),
  );
});

test('approved replacements are structurally valid and included in the runtime bank', () => {
  const runtimeIds = new Set(getAllQuestions().map((question) => question.id));

  assert.equal(ORIGINAL_REPLACEMENT_CANDIDATES.length, 4);
  assert.equal(
    new Set(ORIGINAL_REPLACEMENT_CANDIDATES.map((question) => question.id)).size,
    4,
  );

  for (const question of ORIGINAL_REPLACEMENT_CANDIDATES) {
    assert.doesNotThrow(() => validateAuthoredQuestion(question));
    assert.equal(question.source.publisher, 'ScoreBetter');
    assert.equal(runtimeIds.has(question.id), true);
  }
});

test('approved replacements return correct and primary-trap diagnostics', () => {
  const service = new QuizService();

  for (const question of ORIGINAL_REPLACEMENT_CANDIDATES) {
    const [correctOptionId, trapOptionId] = question.optionRanking;
    const correct = service.submit({
      questionId: question.id,
      selectedOptionId: correctOptionId,
      secondChoiceOptionId: trapOptionId,
    });
    assert.equal(correct.correct, true);
    assert.equal(correct.label, 'crystal-clear');

    const trapped = service.submit({
      questionId: question.id,
      selectedOptionId: trapOptionId,
      secondChoiceOptionId: correctOptionId,
    });
    assert.equal(trapped.correct, false);
    assert.equal(trapped.label, 'confused-sensed-truth');
    assert.ok(
      trapped.explanation.some((part) =>
        part.startsWith(`Primary-trap analysis (${trapOptionId}):`),
      ),
    );
  }
});

const cases: Array<{
  name: string;
  expected: DiagnosticLabel;
  marks: Parameters<typeof classifyMarks>[0];
}> = [
  {
    name: 'correct answer with trap as second choice',
    expected: 'crystal-clear',
    marks: { selectedOptionId: 'A', secondChoiceOptionId: 'B' },
  },
  {
    name: 'correct answer without trap as second choice',
    expected: 'some-confusion',
    marks: { selectedOptionId: 'A' },
  },
  {
    name: 'trap selected with correct answer as second choice',
    expected: 'confused-sensed-truth',
    marks: { selectedOptionId: 'B', secondChoiceOptionId: 'A' },
  },
  {
    name: 'trap selected after eliminating correct answer',
    expected: 'fooled-dismissed-truth',
    marks: {
      selectedOptionId: 'B',
      secondChoiceOptionId: 'C',
      eliminatedOptionIds: ['A'],
    },
  },
  {
    name: 'trap selected with correct answer unmarked',
    expected: 'fooled-blind-spot',
    marks: { selectedOptionId: 'B', secondChoiceOptionId: 'C' },
  },
  {
    name: 'weaker answer selected with trap second and correct unmarked',
    expected: 'blind-spot-on-correct',
    marks: { selectedOptionId: 'C', secondChoiceOptionId: 'B' },
  },
  {
    name: 'weaker answer selected with trap second and correct eliminated',
    expected: 'dismissed-truth-entirely',
    marks: {
      selectedOptionId: 'C',
      secondChoiceOptionId: 'B',
      eliminatedOptionIds: ['A'],
    },
  },
  {
    name: 'weaker answer selected with correct answer second',
    expected: 'doubted-truth',
    marks: { selectedOptionId: 'C', secondChoiceOptionId: 'A' },
  },
  {
    name: 'weaker answer selected without correct or trap as second choice',
    expected: 'lost',
    marks: { selectedOptionId: 'C', secondChoiceOptionId: 'D' },
  },
];

for (const testCase of cases) {
  test(testCase.name, () => {
    assert.equal(classifyMarks(testCase.marks, ranking), testCase.expected);
  });
}

test('correct answer remains some-confusion when every alternative is eliminated', () => {
  assert.equal(
    classifyMarks(
      { selectedOptionId: 'A', eliminatedOptionIds: ['B', 'C', 'D'] },
      ranking,
    ),
    'some-confusion',
  );
});

test('correct second choice takes priority when the trap was eliminated', () => {
  assert.equal(
    classifyMarks(
      {
        selectedOptionId: 'C',
        secondChoiceOptionId: 'A',
        eliminatedOptionIds: ['B', 'D'],
      },
      ranking,
    ),
    'doubted-truth',
  );
});

test('submit returns a diagnostic label and explanation', () => {
  const question = getFirstQuestion();
  const service = new QuizService();

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: question.optionRanking[0],
    secondChoiceOptionId: question.optionRanking[1],
  });

  assert.equal(result.label, 'crystal-clear');
  assert.ok(
    result.explanation.some((part) =>
      part.startsWith(`Correct-answer reasoning (${question.optionRanking[0]}):`),
    ),
  );
});

test('explanation heading matches the primary trap when the trap is what was selected', () => {
  const question = getFirstQuestion();
  const service = new QuizService();
  const trapOptionId = question.optionRanking[1];

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: trapOptionId,
  });

  assert.ok(
    result.explanation.some((part) =>
      part.startsWith(`Primary-trap analysis (${trapOptionId}):`),
    ),
  );
});

test('explanation heading matches the selected option\'s own classification, not the primary trap', () => {
  const question = getFirstQuestion();
  const service = new QuizService();
  const secondaryDistractorOptionId = question.optionRanking[2];

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: secondaryDistractorOptionId,
    secondChoiceOptionId: question.optionRanking[0],
  });

  assert.equal(result.label, 'doubted-truth');
  assert.ok(
    result.explanation.some((part) =>
      part.startsWith(
        `Secondary-distractor analysis (${secondaryDistractorOptionId}):`,
      ),
    ),
  );
  assert.ok(!result.explanation.some((part) => part.startsWith('Primary-trap analysis')));
});

test('explanation uses a student-facing heading for a weak-distractor selection', () => {
  const question = getFirstQuestion();
  const service = new QuizService();
  const weakDistractorOptionId = question.optionRanking[3];

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: weakDistractorOptionId,
  });

  assert.ok(
    result.explanation.some((part) =>
      part.startsWith(`Why this doesn't hold up (${weakDistractorOptionId}):`),
    ),
  );
});

test('submit rejects an option ID outside the question', () => {
  const question = getFirstQuestion();
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: question.id,
        selectedOptionId: 'not-an-option',
      }),
    BadRequestException,
  );
});

test('submit rejects contradictory marks on the same option', () => {
  const question = getFirstQuestion();
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: question.id,
        selectedOptionId: question.optionRanking[0],
        eliminatedOptionIds: [question.optionRanking[0]],
      }),
    BadRequestException,
  );
});

test('submit rejects a malformed second-choice value at runtime', () => {
  const question = getFirstQuestion();
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: question.id,
        selectedOptionId: question.optionRanking[0],
        secondChoiceOptionId: 42,
      } as never),
    BadRequestException,
  );
});

test('submit returns trap explanation with whyTempting and whyWrong', () => {
  const question = getFirstQuestion();
  const service = new QuizService();

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: question.optionRanking[0],
  });

  assert.ok(result.trapExplanation);
  assert.equal(result.trapExplanation.optionId, question.optionRanking[1]);
  assert.ok(result.trapExplanation.whyTempting.length > 0);
  assert.ok(result.trapExplanation.whyWrong.length > 0);
});

test('getOptionAnalysisFor returns the rationale and option text for a given option', () => {
  const question = getFirstQuestion();
  const correctOptionId = question.optionRanking[0];

  const view = getOptionAnalysisFor(question, correctOptionId);

  assert.equal(view.optionId, correctOptionId);
  assert.equal(
    view.optionText,
    question.options.find((o) => o.id === correctOptionId)?.text,
  );
  assert.equal(view.classification, 'correct');
  assert.ok(view.rationale.length > 0);
  assert.ok(view.likelyReasoning.length > 0);
});

test('getComparison returns both sides with roles relative to the marks', () => {
  const question = getFirstQuestion();
  const [correctOptionId, trapOptionId] = question.optionRanking;
  const marks: Marks = { selectedOptionId: correctOptionId, secondChoiceOptionId: trapOptionId };

  const { a, b } = getComparison(question, marks, correctOptionId, trapOptionId);

  assert.equal(a.optionId, correctOptionId);
  assert.equal(a.role, 'correct');
  assert.equal(b.optionId, trapOptionId);
  assert.equal(b.role, 'trap');
});

const EXPECTED_COMPARISON_COUNTS: Record<DiagnosticLabel, number> = {
  'crystal-clear': 1,
  'some-confusion': 1,
  'confused-sensed-truth': 1,
  'fooled-dismissed-truth': 1,
  'fooled-blind-spot': 1,
  'blind-spot-on-correct': 2,
  'dismissed-truth-entirely': 2,
  'doubted-truth': 1,
  lost: 1,
};

const fakeQuestion = {
  optionRanking: ranking,
  options: ranking.map((id) => ({ id, text: `Option ${id}` })),
} as unknown as Parameters<typeof getAvailableComparisons>[1];

for (const testCase of cases) {
  test(`getAvailableComparisons produces the expected button set for ${testCase.expected}`, () => {
    const comparisons = getAvailableComparisons(testCase.expected, fakeQuestion, testCase.marks);

    assert.equal(comparisons.length, EXPECTED_COMPARISON_COUNTS[testCase.expected]);
    for (const comparison of comparisons) {
      assert.ok(ranking.includes(comparison.optionIdA));
      assert.ok(ranking.includes(comparison.optionIdB));
      assert.notEqual(comparison.optionIdA, comparison.optionIdB);
      assert.ok(comparison.buttonLabel.length > 0);
    }
  });
}

test('getAvailableComparisons flags dismissed-truth-entirely and fooled-dismissed-truth as eliminated framing', () => {
  const dismissedTruthEntirely = getAvailableComparisons(
    'dismissed-truth-entirely',
    fakeQuestion,
    { selectedOptionId: 'C', secondChoiceOptionId: 'B', eliminatedOptionIds: ['A'] },
  );
  assert.ok(dismissedTruthEntirely.some((c) => c.framing === 'eliminated'));

  const fooledDismissedTruth = getAvailableComparisons('fooled-dismissed-truth', fakeQuestion, {
    selectedOptionId: 'B',
    secondChoiceOptionId: 'C',
    eliminatedOptionIds: ['A'],
  });
  assert.equal(fooledDismissedTruth[0].framing, 'eliminated');
});

test('getAvailableComparisons flags crystal-clear as reinforcement framing', () => {
  const comparisons = getAvailableComparisons('crystal-clear', fakeQuestion, {
    selectedOptionId: 'A',
    secondChoiceOptionId: 'B',
  });
  assert.equal(comparisons[0].framing, 'reinforcement');
});

test('submit with bank question ignores the client-supplied authoredQuestion', () => {
  const question = getFirstQuestion();
  const service = new QuizService();
  const fakeAuthoredQuestion: Question = {
    id: question.id,
    prompt: 'Fake prompt',
    options: [
      { id: 'A', text: 'Fake' },
      { id: 'B', text: 'Fake' },
      { id: 'C', text: 'Fake' },
      { id: 'D', text: 'Fake' },
    ],
    domain: 'Craft and Structure',
    skill: 'Fake',
    source: { publisher: 'ScoreBetter', origin: 'original-practice', authoredBy: 'human' },
    optionRanking: ['A', 'B', 'C', 'D'],
    optionAnalysis: [
      { optionId: 'A', rank: 1, classification: 'correct', rationale: 'Fake', likelyReasoning: 'Fake' },
      { optionId: 'B', rank: 2, classification: 'primary-trap', rationale: 'Fake', likelyReasoning: 'Fake' },
      { optionId: 'C', rank: 3, classification: 'secondary-distractor', rationale: 'Fake', likelyReasoning: 'Fake' },
      { optionId: 'D', rank: 4, classification: 'weak-distractor', rationale: 'Fake', likelyReasoning: 'Fake' },
    ],
  };

  const result = service.submit({
    questionId: question.id,
    selectedOptionId: question.optionRanking[0],
    authoredQuestion: fakeAuthoredQuestion,
  });

  assert.equal(result.correct, true);
  assert.equal(result.correctOptionId, question.optionRanking[0]);
});

test('submit with unknown question id uses the authoredQuestion from payload', () => {
  const service = new QuizService();
  const authoredQuestion: Question = {
    id: 'uploaded-question-001',
    prompt: 'Which is correct?',
    passage: 'Some passage',
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' },
    ],
    domain: 'Craft and Structure',
    skill: 'Test Skill',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'human',
    },
    optionRanking: ['B', 'A', 'C', 'D'],
    optionAnalysis: [
      { optionId: 'B', rank: 1, classification: 'correct', rationale: 'Correct', likelyReasoning: 'Correct' },
      { optionId: 'A', rank: 2, classification: 'primary-trap', rationale: 'Trap', likelyReasoning: 'Tempting' },
      { optionId: 'C', rank: 3, classification: 'secondary-distractor', rationale: 'Wrong', likelyReasoning: 'Less' },
      { optionId: 'D', rank: 4, classification: 'weak-distractor', rationale: 'Wrong', likelyReasoning: 'Least' },
    ],
  };

  const result = service.submit({
    questionId: 'uploaded-question-001',
    selectedOptionId: 'B',
    authoredQuestion,
  });

  assert.equal(result.correct, true);
  assert.equal(result.correctOptionId, 'B');
  assert.equal(result.trapOptionId, 'A');
});

test('submit rejects authoredQuestion with missing fields', () => {
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: 'unknown-001',
        selectedOptionId: 'A',
        authoredQuestion: {
          id: 'unknown-001',
          prompt: 'Test',
          options: [{ id: 'A', text: 'Test' }],
        } as never,
      }),
    BadRequestException,
  );
});

test('submit rejects authoredQuestion with invalid optionRanking references', () => {
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: 'unknown-001',
        selectedOptionId: 'A',
        authoredQuestion: {
          id: 'unknown-001',
          prompt: 'Test',
          options: [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' },
          ],
          optionRanking: ['A', 'B', 'X', 'D'] as never,
          optionAnalysis: [{}, {}, {}, {}],
        } as never,
      }),
    BadRequestException,
  );
});

function makeValidAuthoredQuestion(): GradableQuestion {
  return {
    id: 'uploaded-validation-001',
    prompt: 'Which option is correct?',
    passage: 'A short passage.',
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' },
    ],
    domain: 'Craft and Structure',
    skill: 'Test Skill',
    optionRanking: ['B', 'A', 'C', 'D'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale: 'Correct rationale',
        likelyReasoning: 'Correct reasoning',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale: 'Trap rationale',
        likelyReasoning: 'Trap reasoning',
      },
      {
        optionId: 'C',
        rank: 3,
        classification: 'secondary-distractor',
        rationale: 'Secondary rationale',
        likelyReasoning: 'Secondary reasoning',
      },
      {
        optionId: 'D',
        rank: 4,
        classification: 'weak-distractor',
        rationale: 'Weak rationale',
        likelyReasoning: 'Weak reasoning',
      },
    ],
  };
}

test('submit preserves 404 for unknown question without authored data', () => {
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: 'missing-question',
        selectedOptionId: 'A',
      }),
    NotFoundException,
  );
});

test('submit rejects an authored question whose id differs from questionId', () => {
  const service = new QuizService();

  assert.throws(
    () =>
      service.submit({
        questionId: 'different-id',
        selectedOptionId: 'B',
        authoredQuestion: makeValidAuthoredQuestion(),
      }),
    BadRequestException,
  );
});

test('submit rejects duplicate authored option ids', () => {
  const service = new QuizService();
  const authoredQuestion = makeValidAuthoredQuestion();
  authoredQuestion.options[3].id = 'C';

  assert.throws(
    () =>
      service.submit({
        questionId: authoredQuestion.id,
        selectedOptionId: 'B',
        authoredQuestion,
      }),
    BadRequestException,
  );
});

test('submit rejects an authored ranking that repeats an option', () => {
  const service = new QuizService();
  const authoredQuestion = makeValidAuthoredQuestion();
  authoredQuestion.optionRanking = ['B', 'A', 'C', 'C'];

  assert.throws(
    () =>
      service.submit({
        questionId: authoredQuestion.id,
        selectedOptionId: 'B',
        authoredQuestion,
      }),
    BadRequestException,
  );
});

test('submit rejects authored analysis with an invalid classification', () => {
  const service = new QuizService();
  const authoredQuestion = makeValidAuthoredQuestion();
  authoredQuestion.optionAnalysis[1].classification = 'correct';

  assert.throws(
    () =>
      service.submit({
        questionId: authoredQuestion.id,
        selectedOptionId: 'B',
        authoredQuestion,
      }),
    BadRequestException,
  );
});

test('submit rejects authored analysis that does not cover every option', () => {
  const service = new QuizService();
  const authoredQuestion = makeValidAuthoredQuestion();
  authoredQuestion.optionAnalysis[3] = {
    ...authoredQuestion.optionAnalysis[2],
  };

  assert.throws(
    () =>
      service.submit({
        questionId: authoredQuestion.id,
        selectedOptionId: 'B',
        authoredQuestion,
      }),
    BadRequestException,
  );
});

test('submit rejects missing authored option text', () => {
  const service = new QuizService();
  const authoredQuestion = makeValidAuthoredQuestion();
  authoredQuestion.options[0].text = '   ';

  assert.throws(
    () =>
      service.submit({
        questionId: authoredQuestion.id,
        selectedOptionId: 'B',
        authoredQuestion,
      }),
    BadRequestException,
  );
});
