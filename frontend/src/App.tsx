import { useEffect, useRef, useState, type RefObject } from 'react';
import { fetchQuestions, submitAnswer } from './api';
import type { DiagnosticLabel, Mark, Marks, Question, SubmitResult } from './types';

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

function ChoiceLetter({
  id,
  tone,
}: {
  id: string;
  tone: 'correct' | 'wrong';
}) {
  return <span className={`choice-letter choice-letter-${tone}`}>{id}</span>;
}

function ResultFeedback({ result }: { result: SubmitResult }) {
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
      {analyses.length > 0 && (
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

function TrapExplanationPanel({
  result,
  panelRef,
}: {
  result: SubmitResult;
  panelRef: RefObject<HTMLElement | null>;
}) {
  const correctRationale = result.explanation.find((part) =>
    part.startsWith('Correct-answer reasoning'),
  );

  return (
    <article ref={panelRef} className="trap-explanation-panel">
      <h2 className="trap-panel-title">Why is this a trap?</h2>
      <div className="trap-blocks">
        <div className="trap-block why-tempting">
          <p className="trap-kicker">Why it's tempting</p>
          <p>{result.trapExplanation.whyTempting}</p>
        </div>
        <div className="trap-block why-wrong">
          <p className="trap-kicker">Why it's wrong</p>
          <p>{result.trapExplanation.whyWrong}</p>
        </div>
      </div>
      {correctRationale && (
        <div className="trap-block trap-vs-correct">
          <p className="trap-kicker">The right answer</p>
          <p>
            {correctRationale.replace(/^Correct-answer reasoning \([A-D]\):\s*/, '')}
          </p>
        </div>
      )}
    </article>
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
  const [trapExplanationOpen, setTrapExplanationOpen] = useState<Record<string, boolean>>({});
  const resultRef = useRef<HTMLElement>(null);
  const trapPanelRef = useRef<HTMLElement>(null);
  const pendingTrapScroll = useRef(false);

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!pendingTrapScroll.current) return;
    trapPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pendingTrapScroll.current = false;
  }, [trapExplanationOpen]);

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

  function revealTrapExplanation() {
    if (trapExplanationOpen[question.id]) {
      trapPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    pendingTrapScroll.current = true;
    setTrapExplanationOpen((prev) => ({ ...prev, [question.id]: true }));
  }

  if (view === 'summary') {
    return (
      <main className="page">
        <h1>SAT English</h1>
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
      <h1>SAT English</h1>
      <p className="progress">
        Question {index + 1} of {questions.length}
      </p>

      {question.passage && <p className="passage">{question.passage}</p>}
      <p className="prompt">{question.prompt}</p>

      <ul className="options">
        {question.options.map((option) => {
          const mark = marks[option.id];
          return (
            <li
              key={option.id}
              className={[
                'option',
                mark,
                result && option.id === result.correctOptionId ? 'revealed-correct' : '',
                result && option.id === result.selectedOptionId && !result.correct
                  ? 'revealed-wrong'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-option={option.id}
            >
              <div className="option-text">
                <span className="option-id">{option.id}</span>
                <span>{option.text}</span>
                {result && option.id === result.correctOptionId && (
                  <span className="pill pill-correct">Correct</span>
                )}
                {result && option.id === result.trapOptionId && (
                  <button
                    type="button"
                    className="pill pill-trap"
                    onClick={revealTrapExplanation}
                  >
                    Trap
                  </button>
                )}
              </div>
              {result && option.id === result.trapOptionId && (
                <button
                  type="button"
                  className="trap-toggle"
                  onClick={revealTrapExplanation}
                >
                  Why is this a trap?
                </button>
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
            <ResultFeedback result={result} />
          </div>
        </section>
      )}

      {result && trapExplanationOpen[question.id] && (
        <TrapExplanationPanel result={result} panelRef={trapPanelRef} />
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
