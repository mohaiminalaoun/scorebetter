# ScoreBetter

Minimal SAT prep scaffold: one hardcoded English question, per-option marking,
and server-side answer checking. No database, no auth, no AI yet.

## Structure

```
backend/    NestJS API (hardcoded questions, answer checking)
frontend/   React + Vite UI
```

## Run

Two terminals:

```bash
cd backend  && npm install && npm run dev   # http://localhost:3000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## API

- `GET  /api/question` — the current question. Omits the correct answer.
- `POST /api/submit` — `{ questionId, selectedOptionId, secondChoiceOptionId, eliminatedOptionIds }`
  returns `{ correct, correctOptionId, selectedOptionId, secondChoiceWasCorrect, label, explanation }`.

The authored option ranking lives only in
`backend/src/questions/sat-reading-writing.questions.ts` and is never sent to
the client before submission. Rank 1 is the correct answer; rank 2 is the
authored primary trap.

## Marking rules

Each option can be marked **Answer**, **Maybe**, or **Eliminate**. Answer and
Maybe are exclusive — assigning either moves it off whichever option held it.
Clicking an option's current mark clears it. Submit requires an Answer.

## Tests

With both servers running:

```bash
cd frontend && npm run e2e        # headless Cypress
cd frontend && npm run e2e:open   # interactive
```

## Next steps

Persistence, more questions, auth, AI explanations.
