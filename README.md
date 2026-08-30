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
  Browser-imported questions also include a validated `authoredQuestion` used
  only when the ID is absent from the server bank.
  Returns `{ correct, correctOptionId, trapOptionId, selectedOptionId, secondChoiceWasCorrect, label, explanation, trapExplanation }`.

For server-bank questions, authored rankings and analysis live only on the
server and are never sent to the client before submission. Rank 1 is the
correct answer; rank 2 is the authored primary trap.

User-imported questions are different: the separately supplied JSON file
contains the full grading metadata, so its answers and analysis are available
to the person importing it and are stored in that browser's local storage. The
backend receives the imported question transiently for grading but does not add
it to the shared question bank or persist it.

### Question bank

- [backend/src/questions/sat-reading-writing.questions.ts](backend/src/questions/sat-reading-writing.questions.ts)
  is the canonical nine-question runtime bank and contains only original
  ScoreBetter practice items.
- Four human-reviewed originals live in
  `backend/src/questions/sat-reading-writing.replacement-candidates.ts` and are
  included in the canonical bank.

The optional browser JSON import remains available for custom questions. The
quiz rejects duplicate IDs and IDs that collide with the server bank. Importing
or clearing a file starts a fresh quiz session.

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

## Deploy

### On Vercel (free, one project)

This repo is a Vercel **Services** app: Vite frontend + NestJS API on one URL. Leave **Root Directory** empty so Vercel reads the root `vercel.json`.

1. Push to GitHub.
2. In Vercel: **Add New Project** → import this repo. Framework should be **Services**.
3. Deploy. You get a production URL (e.g. `scorebetter.vercel.app`).
4. Test: open the URL, load questions, import a JSON file, submit answers.
5. Share the site URL.

The browser calls `/api` on the same host. If the UI is on a different Vercel project, set `VITE_API_URL` to the API origin (with or without `/api`) and redeploy the frontend. Imported questions stay in that browser's `localStorage`. The runtime bank contains original practice items only.

## Next steps

Persistence, auth, AI explanations, and expanding the original practice bank.
