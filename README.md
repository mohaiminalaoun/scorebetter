# ScoreBetter

SAT Reading & Writing practice: multi-question quiz flow, per-option marking
(Answer / Maybe / Eliminate), diagnostic labels, and server-side answer checking.
No database, no auth, no AI yet.

## Structure

```
backend/    NestJS API (in-memory question bank, answer checking)
frontend/   React + Vite UI
```

## Run

Two terminals:

```bash
cd backend  && npm install && npm run dev   # http://localhost:3000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## API

- `GET  /api/questions` — all questions for the quiz UI. Omits correct answers, rankings, and authored analysis.
- `GET  /api/question` — the first question in the bank (same shape as one element of `/api/questions`).
- `POST /api/submit` — body: `{ questionId, selectedOptionId, secondChoiceOptionId, eliminatedOptionIds }`.
  Returns `{ correct, correctOptionId, trapOptionId, selectedOptionId, secondChoiceWasCorrect, label, explanation, trapExplanation }`.

Authored option rankings and per-option analysis live on the server only and are
never sent to the client before submission. Rank 1 is the correct answer; rank 2
is the authored primary trap.

### Question bank

- **Public repo:** [backend/src/questions/sat-reading-writing.questions.ts](backend/src/questions/sat-reading-writing.questions.ts) exports original ScoreBetter practice items only.
- **Private deploy (optional):** add a local file
  `backend/src/questions/sat-reading-writing.questions.official.ts` (gitignored)
  exporting `OFFICIAL_QUESTIONS`. When present, those items are prepended to the
  bank; when absent, the app runs on originals only.

## Marking rules

Each option can be marked **Answer**, **Maybe**, or **Eliminate**. Answer and
Maybe are exclusive — assigning either moves it off whichever option held it.
Clicking an option's current mark clears it. Submit requires an Answer.

## Tests

```bash
cd backend  && npm test              # unit tests (diagnostic classifier, submit)
```

With both servers running:

```bash
cd frontend && npm run e2e        # headless Cypress
cd frontend && npm run e2e:open   # interactive
```

## Next steps

Persistence, auth, AI explanations, and expanding the original practice bank.
