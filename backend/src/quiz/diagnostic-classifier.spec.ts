import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { getFirstQuestion } from '../questions/questions.repository';
import { classifyMarks, type DiagnosticLabel } from './diagnostic-classifier';
import { QuizService } from './quiz.service';

const ranking: [string, string, string, string] = ['A', 'B', 'C', 'D'];

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
