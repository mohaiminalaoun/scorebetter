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

- **Public repo:** [backend/src/questions/sat-reading-writing.questions.ts](backend/src/questions/sat-reading-writing.questions.ts) exports original ScoreBetter practice items only.
- **Private deploy (optional):** add a local file
  `backend/src/questions/sat-reading-writing.questions.official.ts` (gitignored)
  exporting `OFFICIAL_QUESTIONS`. When present, those items are prepended to the
  bank; when absent, the app runs on originals only.

### Private JSON import

To create a local JSON file from the optional private question source:

```bash
cd backend
npm run export-questions
```

The command verifies that the private source exists, builds it, and writes
`official-questions.json` at the repository root. Both that JSON file and the
private TypeScript source are Git-ignored and must be shared separately from the
repository. The quiz rejects duplicate question IDs and IDs that collide with
the server bank. Importing or clearing a file starts a fresh quiz session.

Keeping material out of Git reduces accidental publication through the
repository; it does not determine whether distributing a separate source file
is legally permitted.

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

### Two-project deployment (recommended)

Deploy the frontend and backend to separate Vercel projects for simplicity and to avoid Node.js serverless complexity with NestJS.

#### Backend (Vercel or any Node host)

1. Create a new Vercel project from the `backend/` directory, or deploy to Render/Railway/Fly.
2. Make sure the deployed backend responds to `GET /api/questions`, `GET /api/question`, and `POST /api/submit`.
3. Copy the backend URL (e.g., `https://scorebetter-api.vercel.app`).

#### Frontend (Vercel)

1. Push to GitHub.
2. Create a new Vercel project from this repo.
3. Set environment variable:
   - **VITE_API_URL** = your backend URL (e.g., `https://scorebetter-api.vercel.app`)
4. Deploy. The frontend will call your backend for API requests.
5. Test it: open the URL, import a JSON file, submit answers.
6. Share with users:
   - Send the frontend URL
   - Share `official-questions.json` **separately** (email, AirDrop, Drive — not Git)

#### How it works

Imported questions are stored in **browser localStorage** only — clearing site data or using another device requires re-importing.

The public frontend serves original practice questions by default. Imported official questions are private to each browser; they are validated and graded by the backend but never stored on the server.

### Local development

Two terminals:

```bash
cd backend  && npm install && npm run dev   # http://localhost:3000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

The frontend proxies `/api` → `localhost:3000` during development via `vite.config.ts`.

## Next steps

Persistence, auth, AI explanations, and expanding the original practice bank.
