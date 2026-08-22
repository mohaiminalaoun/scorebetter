import { useEffect, useState } from 'react';
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
              <h3>Question {i + 1}</h3>
              <p className="prompt">{q.prompt}</p>
              {r ? (
                <>
                  <p>
                    You answered <strong>{r.selectedOptionId}</strong>. The correct
                    answer is <strong>{r.correctOptionId}</strong>.
                  </p>
                  {!r.correct && r.secondChoiceWasCorrect && (
                    <p>Your second choice was the correct answer.</p>
                  )}
                  <p className="diagnostic-label">{DIAGNOSTIC_LABEL_TEXT[r.label]}</p>
                  <div className="diagnostic-explanation">
                    {r.explanation.map((part, i) => (
                      <p key={i}>{part}</p>
                    ))}
                  </div>
                </>
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
              className={`option ${mark ?? ''}`}
              data-option={option.id}
            >
              <div className="option-text">
                <span className="option-id">{option.id}</span>
                <span>{option.text}</span>
                {result && option.id === result.correctOptionId && (
                  <span className="pill pill-correct">Correct</span>
                )}
                {result && option.id === result.trapOptionId && (
                  <span className="pill pill-trap">Trap</span>
                )}
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
        <section className={`result ${result.correct ? 'correct' : 'incorrect'}`}>
          <h2>{result.correct ? 'Correct' : 'Incorrect'}</h2>
          <p>
            You answered <strong>{result.selectedOptionId}</strong>. The correct
            answer is <strong>{result.correctOptionId}</strong>.
          </p>
          {!result.correct && result.secondChoiceWasCorrect && (
            <p>Your second choice was the correct answer.</p>
          )}
          <p className="diagnostic-label">{DIAGNOSTIC_LABEL_TEXT[result.label]}</p>
          <div className="diagnostic-explanation">
            {result.explanation.map((part, i) => (
              <p key={i}>{part}</p>
            ))}
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
