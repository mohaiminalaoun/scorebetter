import { useEffect, useRef, useState } from 'react';
import { fetchQuestions, submitAnswer } from './api';
import type {
  ComparisonOption,
  ComparisonSide,
  DiagnosticLabel,
  Mark,
  Marks,
  Question,
  SubmitResult,
} from './types';

const MARK_LABELS: Record<Mark, string> = {
  selected: 'Answer',
  maybe: 'Maybe',
  eliminated: 'Eliminate',
};

const DIAGNOSTIC_LABEL_TEXT: Record<DiagnosticLabel, string> = {
  'crystal-clear': 'Crystal clear',
  'some-confusion': 'Some confusion',
  'confused-sensed-truth': 'Confused, but you sensed the truth',
  'fooled-dismissed-truth': 'Fooled, and you dismissed the truth',
  'fooled-blind-spot': 'Fooled — blind spot on the correct answer',
  'blind-spot-on-correct': 'Blind spot on the correct answer',
  'dismissed-truth-entirely': 'You dismissed the truth entirely',
  'doubted-truth': 'You had it, then changed your mind',
  lost: 'Lost',
};

/**
 * Apply a mark to one option. 'selected' and 'maybe' are exclusive — assigning
 * either one clears it from whichever option previously held it. Clicking the
 * mark an option already has removes it.
 */
function applyMark(marks: Marks, optionId: string, mark: Mark): Marks {
  const next: Marks = { ...marks };

  if (next[optionId] === mark) {
    delete next[optionId];
    return next;
  }

  if (mark === 'selected' || mark === 'maybe') {
    for (const id of Object.keys(next)) {
      if (next[id] === mark) delete next[id];
    }
  }

  next[optionId] = mark;
  return next;
}

function idsWithMark(marks: Marks, mark: Mark): string[] {
  return Object.keys(marks).filter((id) => marks[id] === mark);
}

function splitExplanation(parts: string[]) {
  const [summary, ...rest] = parts;
  return {
    summary,
    analyses: rest.map((part) => {
      const colon = part.indexOf(': ');
      if (colon === -1) return { heading: 'Analysis', body: part };
      return { heading: part.slice(0, colon), body: part.slice(colon + 2) };
    }),
  };
}

type OptionRevealRole = 'correct' | 'wrong-pick' | 'trap';

/** How the student handled this option — drives card color after submit. */
type OptionOutcome = 'good' | 'mistake' | 'neutral';

function getOptionOutcome(
  optionId: string,
  result: SubmitResult,
  optionMarks: Marks,
): OptionOutcome {
  const mark = optionMarks[optionId];
  const isCorrect = optionId === result.correctOptionId;
  const isTrap = optionId === result.trapOptionId;
  const isWrongPick = optionId === result.selectedOptionId && !result.correct;

  if (isWrongPick) return 'mistake';

  if (isCorrect) {
    if (mark === 'eliminated') return 'mistake';
    if (result.correct && mark === 'selected') return 'good';
    if (result.secondChoiceWasCorrect && mark === 'maybe') return 'good';
    return 'neutral';
  }

  if (isTrap) {
    if (mark === 'maybe' || mark === 'eliminated') return 'good';
    return 'neutral';
  }

  if (mark === 'eliminated') return 'good';
  return 'neutral';
}

function getOptionRevealRole(
  optionId: string,
  result: SubmitResult,
): OptionRevealRole | null {
  if (optionId === result.selectedOptionId && !result.correct) {
    return 'wrong-pick';
  }
  if (optionId === result.correctOptionId) return 'correct';
  if (optionId === result.trapOptionId) return 'trap';
  return null;
}

function getOptionVerdictLabel(
  role: OptionRevealRole,
  optionId: string,
  result: SubmitResult,
  optionMarks: Marks,
): string {
  switch (role) {
    case 'wrong-pick':
      return 'Your answer · Incorrect';
    case 'correct': {
      if (optionMarks[optionId] === 'eliminated') {
        return 'Correct answer · you eliminated it';
      }
      if (
        result.secondChoiceWasCorrect &&
        optionMarks[optionId] === 'maybe'
      ) {
        return 'Correct answer · your second choice';
      }
      if (result.selectedOptionId === optionId) {
        return 'Correct answer · your answer';
      }
      return 'Correct answer';
    }
    case 'trap': {
      if (optionMarks[optionId] === 'maybe') {
        return 'Trap · you marked maybe';
      }
      if (optionMarks[optionId] === 'eliminated') {
        return 'Trap · you eliminated it';
      }
      if (optionMarks[optionId] === 'selected') {
        return 'Trap · you selected it';
      }
      return 'Trap';
    }
  }
}

function getDisclosureLabel(role: OptionRevealRole): string {
  switch (role) {
    case 'trap':
      return 'Why is this a trap?';
    case 'wrong-pick':
      return "Why isn't this right?";
    case 'correct':
      return 'Why is this actually right?';
  }
}

/** Disclosure copy follows objective option type (e.g. trap) even when badge is wrong-pick. */
function getDisclosureRole(
  revealRole: OptionRevealRole,
  optionId: string,
  result: SubmitResult,
): OptionRevealRole {
  if (revealRole === 'wrong-pick' && optionId === result.trapOptionId) {
    return 'trap';
  }
  return revealRole;
}

/** Badge emphasis when objective type and student outcome disagree. */
function verdictWarns(
  revealRole: OptionRevealRole,
  optionId: string,
  result: SubmitResult,
  optionMarks: Marks,
): boolean {
  const outcome = getOptionOutcome(optionId, result, optionMarks);
  if (revealRole === 'correct' && outcome === 'mistake') return true;
  if (revealRole === 'trap' && outcome === 'mistake') return true;
  return false;
}

function analysisFor(optionId: string, result: SubmitResult): ComparisonSide | undefined {
  return result.optionAnalyses.find((a) => a.optionId === optionId);
}

function OptionDisclosureContent({
  role,
  optionId,
  result,
}: {
  role: OptionRevealRole;
  optionId: string;
  result: SubmitResult;
}) {
  if (role === 'trap') {
    const correctAnalysis = analysisFor(result.correctOptionId, result);
    return (
      <div className="option-disclosure-content">
        <p className="option-disclosure-kicker">Why it&apos;s tempting</p>
        <p>{result.trapExplanation.whyTempting}</p>
        <p className="option-disclosure-kicker">Why it&apos;s wrong</p>
        <p>{result.trapExplanation.whyWrong}</p>
        {correctAnalysis && (
          <>
            <p className="option-disclosure-kicker">The right answer</p>
            <p>{correctAnalysis.rationale}</p>
          </>
        )}
      </div>
    );
  }

  const analysis = analysisFor(optionId, result);
  return (
    <div className="option-disclosure-content">
      <p>{analysis?.rationale ?? 'No additional detail for this choice.'}</p>
    </div>
  );
}

function ComparisonPanel({
  comparison,
  result,
}: {
  comparison: ComparisonOption;
  result: SubmitResult;
}) {
  const a = analysisFor(comparison.optionIdA, result);
  const b = analysisFor(comparison.optionIdB, result);
  if (!a || !b) return null;

  return (
    <div className="comparison-panel">
      <div className="comparison-side">
        <p className="comparison-side-head">
          <ChoiceLetter id={a.optionId} tone={a.role === 'correct' ? 'correct' : 'wrong'} />
          <span>{a.optionText}</span>
        </p>
        <p>{a.rationale}</p>
      </div>
      <div className="comparison-side">
        <p className="comparison-side-head">
          <ChoiceLetter id={b.optionId} tone={b.role === 'correct' ? 'correct' : 'wrong'} />
          <span>{b.optionText}</span>
        </p>
        <p>{b.rationale}</p>
      </div>
    </div>
  );
}

function ComparisonRow({
  result,
  openId,
  onToggle,
}: {
  result: SubmitResult;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  const { availableComparisons } = result;
  if (availableComparisons.length === 0) return null;

  const active = availableComparisons.find((c) => c.id === openId) ?? null;

  return (
    <div className="comparison-row">
      <div className="comparison-buttons">
        {availableComparisons.map((comparison) => (
          <button
            key={comparison.id}
            type="button"
            className={`comparison-button comparison-framing-${comparison.framing}${
              openId === comparison.id ? ' active' : ''
            }`}
            aria-expanded={openId === comparison.id}
            onClick={() => onToggle(comparison.id)}
          >
            {comparison.buttonLabel}
          </button>
        ))}
      </div>
      {active && <ComparisonPanel comparison={active} result={result} />}
    </div>
  );
}

function ChoiceLetter({
  id,
  tone,
}: {
  id: string;
  tone: 'correct' | 'wrong';
}) {
  return <span className={`choice-letter choice-letter-${tone}`}>{id}</span>;
}

function ResultFeedback({
  result,
  showAnalysisBlocks = true,
}: {
  result: SubmitResult;
  showAnalysisBlocks?: boolean;
}) {
  const { summary, analyses } = splitExplanation(result.explanation);
  const pickedTone = result.correct ? 'correct' : 'wrong';

  return (
    <>
      <div className="result-head">
        <span className={`pill ${result.correct ? 'pill-correct' : 'pill-trap'}`}>
          {result.correct ? 'Correct' : 'Incorrect'}
        </span>
        <p className="diagnostic-label">{DIAGNOSTIC_LABEL_TEXT[result.label]}</p>
      </div>
      <p className="result-picks">
        You answered <ChoiceLetter id={result.selectedOptionId} tone={pickedTone} />.
        The correct answer is{' '}
        <ChoiceLetter id={result.correctOptionId} tone="correct" />.
      </p>
      {!result.correct && result.secondChoiceWasCorrect && (
        <p className="result-note">Your second choice was the correct answer.</p>
      )}
      {summary && <p className="diagnostic-summary">{summary}</p>}
      {showAnalysisBlocks && analyses.length > 0 && (
        <div className="analysis-blocks">
          {analyses.map((analysis) => {
            const isCorrect = analysis.heading.toLowerCase().startsWith('correct-answer');
            return (
              <article
                key={analysis.heading}
                className={`analysis-block ${isCorrect ? 'correct' : 'wrong'}`}
              >
                <p className={`analysis-kicker ${isCorrect ? 'correct' : 'wrong'}`}>
                  {analysis.heading}
                </p>
                <p>{analysis.body}</p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

type View = 'quiz' | 'summary';

export default function App() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [marksByQuestion, setMarksByQuestion] = useState<Record<string, Marks>>({});
  const [resultsByQuestion, setResultsByQuestion] = useState<
    Record<string, SubmitResult>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<View>('quiz');
  const [disclosureOpen, setDisclosureOpen] = useState<Record<string, boolean>>({});
  const [comparisonOpenByQuestion, setComparisonOpenByQuestion] = useState<
    Record<string, string | null>
  >({});
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error && !questions) return <main className="page"><p className="error">{error}</p></main>;
  if (!questions) return <main className="page"><p>Loading…</p></main>;

  const question = questions[index];
  const marks = marksByQuestion[question.id] ?? {};
  const result = resultsByQuestion[question.id] ?? null;
  const selectedOptionId = idsWithMark(marks, 'selected')[0] ?? null;
  const secondChoiceOptionId = idsWithMark(marks, 'maybe')[0] ?? null;
  const isLast = index === questions.length - 1;
  const answeredCount = Object.keys(resultsByQuestion).length;

  function setMarksForCurrent(next: Marks) {
    setMarksByQuestion((prev) => ({ ...prev, [question.id]: next }));
  }

  async function handleSubmit() {
    if (!selectedOptionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer({
        questionId: question.id,
        selectedOptionId,
        secondChoiceOptionId,
        eliminatedOptionIds: idsWithMark(marks, 'eliminated'),
      });
      setResultsByQuestion((prev) => ({ ...prev, [question.id]: res }));
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function goTo(nextIndex: number) {
    setError(null);
    setIndex(nextIndex);
  }

  function toggleDisclosure(optionId: string) {
    const key = `${question.id}:${optionId}`;
    setDisclosureOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleComparison(comparisonId: string) {
    setComparisonOpenByQuestion((prev) => ({
      ...prev,
      [question.id]: prev[question.id] === comparisonId ? null : comparisonId,
    }));
  }

  if (view === 'summary') {
    return (
      <main className="page">
        <div className="app-header">
          <div className="eyebrow">SAT English <span>· Reading & Writing</span></div>
        </div>
        <h2 className="summary-heading">Results</h2>
        <p className="summary-score">
          {Object.values(resultsByQuestion).filter((r) => r.correct).length} / {questions.length} correct
        </p>

        {questions.map((q, i) => {
          const r = resultsByQuestion[q.id];
          return (
            <section key={q.id} className={`result summary-item ${r ? (r.correct ? 'correct' : 'incorrect') : 'unanswered'}`}>
              <div className="result-bar" aria-hidden="true" />
              <div className="result-body">
                <h3>Question {i + 1}</h3>
                <p className="prompt">{q.prompt}</p>
                {r ? (
                  <ResultFeedback result={r} />
                ) : (
                  <p className="error">Not answered.</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setView('quiz');
                    goTo(i);
                  }}
                >
                  Review question
                </button>
              </div>
            </section>
          );
        })}
      </main>
    );
  }

  return (
    <main className="page">
      <div className="app-header">
        <div>
          <div className="eyebrow">SAT English <span>· Reading & Writing</span></div>
          <div className="scantron" aria-label={`Progress: question ${index + 1} of ${questions.length}`}>
            {questions.map((q, i) => {
              const qResult = resultsByQuestion[q.id];
              let bubbleClass = '';
              if (i === index) bubbleClass = 'current';
              else if (qResult?.correct) bubbleClass = 'filled-correct';
              else if (qResult && !qResult.correct) bubbleClass = 'filled-incorrect';
              return (
                <div
                  key={q.id}
                  className={`bubble ${bubbleClass}`}
                  title={`Question ${i + 1}${i === index ? ' — current' : ''}`}
                />
              );
            })}
          </div>
        </div>
      </div>
      <p className="progress">
        Question {index + 1} of {questions.length}
      </p>

      {question.passage && <p className="passage card">{question.passage}</p>}
      <p className="prompt">{question.prompt}</p>

      <ul className={`options${result ? ' options-post-submit' : ''}`}>
        {question.options.map((option) => {
          const mark = marks[option.id];
          const revealRole = result
            ? getOptionRevealRole(option.id, result)
            : null;
          const disclosureKey = `${question.id}:${option.id}`;
          const isDisclosureOpen = Boolean(disclosureOpen[disclosureKey]);
          const disclosureRole =
            revealRole && result
              ? getDisclosureRole(revealRole, option.id, result)
              : null;
          const cardTypeClass = result
            ? revealRole
              ? `option-type-${revealRole}`
              : 'option-type-neutral'
            : '';

          return (
            <li
              key={option.id}
              className={[
                'option',
                result ? '' : mark,
                result ? 'option-post-submit' : '',
                cardTypeClass,
              ]
                .filter(Boolean)
                .join(' ')}
              data-option={option.id}
            >
              {result ? (
                <div className="option-stack">
                  <div className="option-main">
                    <span className="option-id">{option.id}</span>
                    <span className="option-copy">{option.text}</span>
                  </div>
                  {revealRole && (
                    <span
                      className={[
                        'option-verdict',
                        verdictWarns(revealRole, option.id, result, marks)
                          ? 'option-verdict-warn'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {getOptionVerdictLabel(revealRole, option.id, result, marks)}
                    </span>
                  )}
                  {revealRole && (
                    <>
                      <button
                        type="button"
                        className={`option-disclosure option-disclosure-${disclosureRole}`}
                        aria-expanded={isDisclosureOpen}
                        onClick={() => toggleDisclosure(option.id)}
                      >
                        <span>{getDisclosureLabel(disclosureRole!)}</span>
                        <span className="option-disclosure-chevron" aria-hidden>
                          ▼
                        </span>
                      </button>
                      {isDisclosureOpen && disclosureRole && (
                        <OptionDisclosureContent
                          role={disclosureRole}
                          optionId={option.id}
                          result={result}
                        />
                      )}
                    </>
                  )}
                  <div className="marks">
                    {(Object.keys(MARK_LABELS) as Mark[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        data-mark={m}
                        className={mark === m ? 'mark active' : 'mark'}
                        disabled={result !== null}
                        onClick={() => setMarksForCurrent(applyMark(marks, option.id, m))}
                      >
                        {MARK_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="option-text">
                    <span className="option-id">{option.id}</span>
                    <span className="option-copy">{option.text}</span>
                  </div>
                  <div className="marks">
                    {(Object.keys(MARK_LABELS) as Mark[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        data-mark={m}
                        className={mark === m ? 'mark active' : 'mark'}
                        disabled={result !== null}
                        onClick={() => setMarksForCurrent(applyMark(marks, option.id, m))}
                      >
                        {MARK_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {!result && (
        <button
          type="button"
          data-testid="submit"
          className="submit"
          disabled={!selectedOptionId || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      )}

      {error && <p className="error">{error}</p>}

      {result && (
        <section
          ref={resultRef}
          className={`result ${result.correct ? 'correct' : 'incorrect'}`}
        >
          <div className="result-bar" aria-hidden="true" />
          <div className="result-body">
            <ResultFeedback result={result} showAnalysisBlocks={false} />
            <ComparisonRow
              result={result}
              openId={comparisonOpenByQuestion[question.id] ?? null}
              onToggle={toggleComparison}
            />
          </div>
        </section>
      )}

      <nav className="pager">
        <button
          type="button"
          data-testid="prev"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          Previous
        </button>
        <span className="pager-status">{answeredCount} / {questions.length} answered</span>
        {isLast ? (
          <button
            type="button"
            data-testid="finish"
            className="submit"
            onClick={() => setView('summary')}
          >
            See results
          </button>
        ) : (
          <button type="button" data-testid="next" onClick={() => goTo(index + 1)}>
            Next
          </button>
        )}
      </nav>
    </main>
  );
}
