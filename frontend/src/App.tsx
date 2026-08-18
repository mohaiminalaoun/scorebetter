import { useEffect, useState } from 'react';
import { fetchQuestion, submitAnswer } from './api';
import type { Mark, Marks, Question, SubmitResult } from './types';

const MARK_LABELS: Record<Mark, string> = {
  selected: 'Answer',
  maybe: 'Maybe',
  eliminated: 'Eliminate',
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

export default function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestion()
      .then(setQuestion)
      .catch((e: Error) => setError(e.message));
  }, []);

  const selectedOptionId = idsWithMark(marks, 'selected')[0] ?? null;
  const secondChoiceOptionId = idsWithMark(marks, 'maybe')[0] ?? null;

  async function handleSubmit() {
    if (!question || !selectedOptionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer({
        questionId: question.id,
        selectedOptionId,
        secondChoiceOptionId,
        eliminatedOptionIds: idsWithMark(marks, 'eliminated'),
      });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setMarks({});
    setResult(null);
    setError(null);
  }

  if (error && !question) return <main className="page"><p className="error">{error}</p></main>;
  if (!question) return <main className="page"><p>Loading…</p></main>;

  return (
    <main className="page">
      <h1>SAT English</h1>

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
              </div>
              <div className="marks">
                {(Object.keys(MARK_LABELS) as Mark[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-mark={m}
                    className={mark === m ? 'mark active' : 'mark'}
                    disabled={result !== null}
                    onClick={() => setMarks(applyMark(marks, option.id, m))}
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

      {error && question && <p className="error">{error}</p>}

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
          <button type="button" onClick={handleReset}>
            Try again
          </button>
        </section>
      )}
    </main>
  );
}
