/// <reference types="cypress" />

const option = (id: string) => cy.get(`[data-option="${id}"]`);
const mark = (id: string, m: 'selected' | 'maybe' | 'eliminated') =>
  option(id).find(`[data-mark="${m}"]`);

const importedQuestion = (id = 'uploaded-practice-001') => ({
  id,
  prompt: 'Which imported option is correct?',
  passage: 'This passage came from an in-memory Cypress fixture.',
  domain: 'Craft and Structure',
  skill: 'Words in Context',
  options: [
    { id: 'A', text: 'Imported option A' },
    { id: 'B', text: 'Imported option B' },
    { id: 'C', text: 'Imported option C' },
    { id: 'D', text: 'Imported option D' },
  ],
  optionRanking: ['B', 'A', 'C', 'D'],
  optionAnalysis: [
    {
      optionId: 'B',
      rank: 1,
      classification: 'correct',
      rationale: 'B is correct.',
      likelyReasoning: 'The evidence supports B.',
    },
    {
      optionId: 'A',
      rank: 2,
      classification: 'primary-trap',
      rationale: 'A is the primary trap.',
      likelyReasoning: 'A repeats a nearby phrase.',
    },
    {
      optionId: 'C',
      rank: 3,
      classification: 'secondary-distractor',
      rationale: 'C is unsupported.',
      likelyReasoning: 'C sounds generally plausible.',
    },
    {
      optionId: 'D',
      rank: 4,
      classification: 'weak-distractor',
      rationale: 'D contradicts the passage.',
      likelyReasoning: 'D is a surface-level match.',
    },
  ],
});

const importJson = (contents: unknown) =>
  cy.get('[data-testid="import-input"]').selectFile(
    {
      contents: Cypress.Buffer.from(JSON.stringify(contents)),
      fileName: 'questions.json',
      mimeType: 'application/json',
    },
    { force: true },
  );

describe('SAT question flow', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });
    cy.contains('.eyebrow', 'SAT English');
  });

  it('shows the question with four options', () => {
    cy.get('[data-option]').should('have.length', 4);
    cy.get('.prompt').should('not.be.empty');
    cy.get('[data-option="A"]').should('not.be.empty');
  });

  it('does not leak the correct answer to the client', () => {
    cy.request('http://localhost:3000/api/question').its('body').should('not.have.property', 'correctOptionId');
  });

  it('disables submit until an answer is selected', () => {
    cy.get('[data-testid="submit"]').should('be.disabled');
    mark('A', 'selected').click();
    cy.get('[data-testid="submit"]').should('be.enabled');
  });

  it('allows only one selected answer', () => {
    mark('B', 'selected').click();
    option('B').should('have.class', 'selected');

    mark('A', 'selected').click();
    option('A').should('have.class', 'selected');
    option('B').should('not.have.class', 'selected');
  });

  it('allows only one second choice', () => {
    mark('B', 'maybe').click();
    option('B').should('have.class', 'maybe');

    mark('C', 'maybe').click();
    option('C').should('have.class', 'maybe');
    option('B').should('not.have.class', 'maybe');
  });

  it('allows eliminating multiple options, and toggling a mark off', () => {
    mark('C', 'eliminated').click();
    mark('D', 'eliminated').click();
    option('C').should('have.class', 'eliminated');
    option('D').should('have.class', 'eliminated');

    mark('D', 'eliminated').click();
    option('D').should('not.have.class', 'eliminated');
  });

  it('reports a correct answer', () => {
    importJson([importedQuestion()]);
    cy.contains('.prompt', 'Which imported option is correct?');
    mark('B', 'selected').click();
    mark('A', 'maybe').click();
    mark('D', 'eliminated').click();
    cy.get('[data-testid="submit"]').click();

    cy.get('.result').should('have.class', 'correct');
    cy.contains('.result .pill', 'Correct');
    cy.contains('.result', 'The correct answer is');
    cy.get('.mark').should('be.disabled');
  });

  it('reports an incorrect answer and flags a correct second choice', () => {
    importJson([importedQuestion()]);
    cy.contains('.prompt', 'Which imported option is correct?');
    mark('C', 'selected').click();
    mark('B', 'maybe').click();
    cy.get('[data-testid="submit"]').click();

    cy.get('.result').should('have.class', 'incorrect');
    cy.contains('.result .pill', 'Incorrect');
    cy.contains('.result', 'Your second choice was the correct answer.');
  });

  it('does not flag the second choice when it was also wrong', () => {
    importJson([importedQuestion()]);
    cy.contains('.prompt', 'Which imported option is correct?');
    mark('C', 'selected').click();
    mark('D', 'maybe').click();
    cy.get('[data-testid="submit"]').click();

    cy.contains('.result .pill', 'Incorrect');
    cy.get('.result').should('not.contain', 'Your second choice was the correct answer.');
  });

  it('imports and grades a valid browser-local question', () => {
    importJson([importedQuestion()]);

    cy.contains('1 extra question loaded');
    cy.contains('.prompt', 'Which imported option is correct?');
    mark('B', 'selected').click();
    cy.get('[data-testid="submit"]').click();
    cy.get('.result').should('have.class', 'correct');
  });

  it('rejects duplicate imported IDs without disturbing current progress', () => {
    mark('A', 'selected').click();
    importJson([
      importedQuestion('duplicate-id'),
      importedQuestion('duplicate-id'),
    ]);

    cy.contains('Error: Duplicate question IDs: duplicate-id');
    option('A').should('have.class', 'selected');
    cy.get('[data-testid="submit"]').should('be.enabled');
  });

  it('rejects imported IDs that collide with the server bank', () => {
    cy.request('http://localhost:3000/api/questions').then(({ body }) => {
      importJson([importedQuestion(body[0].id)]);
    });

    cy.contains('Error: Question IDs conflict with the question bank:');
    cy.get('.prompt').should('not.contain', 'Which imported option is correct?');
  });

  it('resets progress after importing and clearing a question set', () => {
    mark('A', 'selected').click();
    cy.get('[data-testid="submit"]').click();
    cy.get('.pager-status').should('contain', '1 /');

    importJson([importedQuestion()]);
    cy.contains('.prompt', 'Which imported option is correct?');
    cy.get('.pager-status').should('contain', '0 /');
    cy.get('.result').should('not.exist');
    cy.get('[data-testid="submit"]').should('be.disabled');

    mark('B', 'selected').click();
    cy.get('[data-testid="submit"]').click();
    cy.get('[data-testid="clear-import"]').click();
    cy.contains('Import JSON');
    cy.get('.pager-status').should('contain', '0 /');
    cy.get('.result').should('not.exist');
  });

  it('removes malformed saved imports and still loads bank questions', () => {
    cy.window().then((win) => {
      win.localStorage.setItem(
          'scorebetter-imported-questions',
          JSON.stringify([{ id: 'broken' }]),
      );
    });
    cy.reload();

    cy.contains('Error: Saved import was removed:');
    cy.get('[data-option]').should('have.length', 4);
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'scorebetter-imported-questions')
      .should('be.null');
  });
});
