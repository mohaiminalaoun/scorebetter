/// <reference types="cypress" />

const option = (id: string) => cy.get(`[data-option="${id}"]`);
const mark = (id: string, m: 'selected' | 'maybe' | 'eliminated') =>
  option(id).find(`[data-mark="${m}"]`);

describe('SAT question flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('h1', 'SAT English');
  });

  it('shows the question with four options', () => {
    cy.get('[data-option]').should('have.length', 4);
    cy.contains('.passage', 'the museum had acquired the painting');
    cy.get('[data-option="A"]').should('contain', 'disputed');
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
    mark('A', 'selected').click();
    mark('B', 'maybe').click();
    mark('D', 'eliminated').click();
    cy.get('[data-testid="submit"]').click();

    cy.get('.result').should('have.class', 'correct');
    cy.contains('.result h2', 'Correct');
    cy.contains('.result', 'The correct answer is');
    cy.get('.mark').should('be.disabled');
  });

  it('reports an incorrect answer and flags a correct second choice', () => {
    mark('C', 'selected').click();
    mark('A', 'maybe').click();
    cy.get('[data-testid="submit"]').click();

    cy.get('.result').should('have.class', 'incorrect');
    cy.contains('.result h2', 'Incorrect');
    cy.contains('.result', 'Your second choice was the correct answer.');
  });

  it('does not flag the second choice when it was also wrong', () => {
    mark('C', 'selected').click();
    mark('D', 'maybe').click();
    cy.get('[data-testid="submit"]').click();

    cy.contains('.result h2', 'Incorrect');
    cy.get('.result').should('not.contain', 'Your second choice was the correct answer.');
  });

  it('resets back to a fresh question', () => {
    mark('A', 'selected').click();
    cy.get('[data-testid="submit"]').click();
    cy.contains('.result button', 'Try again').click();

    cy.get('.result').should('not.exist');
    cy.get('[data-option="A"]').should('not.have.class', 'selected');
    cy.get('[data-testid="submit"]').should('be.disabled');
  });
});
