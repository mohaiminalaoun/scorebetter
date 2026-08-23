import type { Question } from './question.model';

const OFFICIAL_QUESTIONS_MODULE =
  './sat-reading-writing.questions.official';

/**
 * Attempts to load OFFICIAL_QUESTIONS from sat-reading-writing.questions.official.ts.
 * This file is gitignored and only present in private deployments.
 *
 * Returns an empty array if the file is not found (public repos use originals only).
 * If the file exists but is invalid, the error is thrown (do not hide broken private data).
 */
function loadOfficialQuestions(): Question[] {
  let modulePath: string;

  try {
    modulePath = require.resolve(OFFICIAL_QUESTIONS_MODULE);
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      err.code === 'MODULE_NOT_FOUND'
    ) {
      return [];
    }
    throw err;
  }

  // Resolve separately so failures inside the private module are never mistaken
  // for the optional module itself being absent.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const privateModule: unknown = require(modulePath);

  if (
    typeof privateModule !== 'object' ||
    privateModule === null ||
    !('OFFICIAL_QUESTIONS' in privateModule) ||
    !Array.isArray(privateModule.OFFICIAL_QUESTIONS)
  ) {
    throw new TypeError(
      `${OFFICIAL_QUESTIONS_MODULE} must export OFFICIAL_QUESTIONS as an array`,
    );
  }

  return privateModule.OFFICIAL_QUESTIONS as Question[];
}

/**
 * Original ScoreBetter practice items written to mirror official SAT Reading &
 * Writing structure and trap patterns. These are NOT College Board content and
 * must not be presented to students as real or retired SAT questions. They are
 * AI-drafted: the correct answers are solid, but the primary-trap rankings are
 * hypotheses to validate against student sessions before they are fully trusted.
 */
const ORIGINAL_PRACTICE_QUESTIONS: Question[] = [
  {
    id: 'scorebetter-original-rw-words-in-context-01',
    domain: 'Craft and Structure',
    skill: 'Words in Context',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      "The marine biologist's report was praised for its ______ approach: rather than relying on secondhand accounts, she spent eleven months diving at the reef site herself, recording data firsthand.",
    prompt:
      'Which choice completes the text with the most logical and precise word?',
    options: [
      { id: 'A', text: 'theoretical' },
      { id: 'B', text: 'empirical' },
      { id: 'C', text: 'collaborative' },
      { id: 'D', text: 'conventional' },
    ],
    optionRanking: ['B', 'A', 'D', 'C'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          '“Empirical” means based on direct observation or experience, which matches “spent eleven months diving… recording data firsthand” exactly.',
        likelyReasoning:
          'Anchors the blank to the firsthand-data detail and picks the word that names observation-based work.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          '“Theoretical” is the classic foil to “empirical,” so a student who recalls the empirical/theoretical pairing but reverses its direction lands here; it actually describes the opposite of the hands-on method the sentence praises.',
        likelyReasoning:
          'Recognizes the academic empirical-vs-theoretical dichotomy but misremembers which term names firsthand fieldwork.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          '“Conventional” means usual or traditional, which fails to capture the explicit “rather than… she…” contrast the sentence sets up around firsthand work.',
        likelyReasoning:
          'Reads the word as a vague compliment for rigorous work without testing it against the sentence’s contrast structure.',
      },
      {
        optionId: 'C',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'Nothing in the sentence mentions other people or teamwork, so “collaborative” has no textual support.',
        likelyReasoning:
          'Loosely associates a months-long project with a team even though no collaborators are named.',
      },
    ],
  },
  {
    id: 'scorebetter-original-rw-transitions-01',
    domain: 'Expression of Ideas',
    skill: 'Transitions',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'The city council approved funding for the new bike lanes last spring. ______, construction has yet to begin, as the project remains tied up in a permitting dispute with a neighboring county.',
    prompt: 'Which choice completes the text with the most logical transition?',
    options: [
      { id: 'A', text: 'Consequently' },
      { id: 'B', text: 'Similarly' },
      { id: 'C', text: 'However' },
      { id: 'D', text: 'In addition' },
    ],
    optionRanking: ['C', 'A', 'D', 'B'],
    optionAnalysis: [
      {
        optionId: 'C',
        rank: 1,
        classification: 'correct',
        rationale:
          '“However” correctly signals the contrast between funding being approved and construction still not beginning.',
        likelyReasoning:
          'Identifies that the second clause undercuts the expectation set by the first and selects a contrast transition.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          '“Consequently” implies the funding approval caused the delay, inverting the logic — the delay happens despite the funding, because of an unrelated permitting dispute.',
        likelyReasoning:
          'Treats the two clauses’ time sequence as a cause-and-effect relationship.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          '“In addition” would fit only if the second clause added a compatible fact, but “yet to begin” undercuts the first clause rather than supplementing it.',
        likelyReasoning:
          'Reads both clauses as being about the same project and assumes an additive relationship.',
      },
      {
        optionId: 'B',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          '“Similarly” requires two parallel situations, but no second comparable case is described.',
        likelyReasoning:
          'Has little surface plausibility; chosen mainly by elimination or guessing.',
      },
    ],
  },
  {
    id: 'scorebetter-original-rw-command-of-evidence-01',
    domain: 'Information and Ideas',
    skill: 'Command of Evidence (Textual)',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'Proponents of the four-day workweek argue it improves employee focus without reducing output. A 2019 trial at a New Zealand firm found that after switching to a four-day week, output per employee rose by 20%, even though total working hours fell by 20%.',
    prompt:
      'Which choice best supports the claim that a four-day workweek can maintain output despite fewer hours?',
    options: [
      {
        id: 'A',
        text: 'A 2019 trial at a New Zealand firm found that after switching to a four-day week, output per employee rose by 20%',
      },
      {
        id: 'B',
        text: 'Proponents of the four-day workweek argue it improves employee focus',
      },
      { id: 'C', text: 'total working hours fell by 20%' },
      { id: 'D', text: 'without reducing output' },
    ],
    optionRanking: ['A', 'D', 'C', 'B'],
    optionAnalysis: [
      {
        optionId: 'A',
        rank: 1,
        classification: 'correct',
        rationale:
          'It is the measured result showing output rose even as hours fell, which directly supports the claim in question.',
        likelyReasoning:
          'Looks for the data point that connects fewer hours to maintained output and finds the one that reports both.',
      },
      {
        optionId: 'D',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It is lifted directly from the claim itself, so it restates what needs to be proven rather than providing supporting data.',
        likelyReasoning:
          'Matches the exact wording of the claim, which makes the restatement feel like direct support.',
      },
      {
        optionId: 'C',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'It is true and quantitative, but it shows only that hours dropped — not that output was maintained — so it supports just half the claim.',
        likelyReasoning:
          'Associates a concrete number with “evidence” without checking that it addresses the output half of the claim.',
      },
      {
        optionId: 'B',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'It attributes an argument to proponents rather than offering evidence; it is the setup for the claim, not proof of it.',
        likelyReasoning:
          'Reads “proponents” as evidence-adjacent even though the statement is opinion attribution.',
      },
    ],
  },
  {
    id: 'scorebetter-original-rw-central-idea-01',
    domain: 'Information and Ideas',
    skill: 'Central Ideas and Details',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      "When the printing press spread across Europe in the 15th century, it didn't just make books cheaper — it restructured who had access to ideas at all. Literacy rates rose not because people suddenly valued reading more, but because reading material became affordable enough that valuing it was possible for the first time.",
    prompt: 'Which choice best states the main idea of the text?',
    options: [
      {
        id: 'A',
        text: 'The printing press made books more affordable than they had been before.',
      },
      {
        id: 'B',
        text: 'Access to affordable books enabled wider literacy, not a prior shift in attitudes.',
      },
      {
        id: 'C',
        text: 'People in the 15th century did not initially value reading.',
      },
      {
        id: 'D',
        text: 'The printing press was invented in the 15th century and spread across Europe.',
      },
    ],
    optionRanking: ['B', 'A', 'C', 'D'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          'It captures the passage’s reversal-of-assumption argument: affordability caused literacy growth rather than a change in attitudes coming first.',
        likelyReasoning:
          'Identifies the causal claim the passage is built around and states it directly.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It is true and directly stated, but it is a supporting detail rather than the main idea, missing the causal argument about literacy and attitudes.',
        likelyReasoning:
          'Mistakes an explicitly true sentence from the passage for its overall point.',
      },
      {
        optionId: 'C',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'It echoes the passage’s “not because people valued reading more” phrasing but distorts it: the text says valuing reading was not yet possible due to cost, not that people did not value it.',
        likelyReasoning:
          'Latches onto familiar passage wording while dropping the actual nuance about affordability.',
      },
      {
        optionId: 'D',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'It restates purely factual background from the opening clause and never touches the passage’s causal claim.',
        likelyReasoning:
          'Treats the first sentence as a summary of the whole passage.',
      },
    ],
  },
  {
    id: 'scorebetter-original-rw-conventions-01',
    domain: 'Standard English Conventions',
    skill: 'Form, Structure, and Sense',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'The committee overseeing the new grant proposals ______ scheduled to meet next Thursday.',
    prompt:
      'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { id: 'A', text: 'are' },
      { id: 'B', text: 'is' },
      { id: 'C', text: 'were' },
      { id: 'D', text: 'have been' },
    ],
    optionRanking: ['B', 'A', 'D', 'C'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          '“Committee” is a singular collective noun and the true grammatical subject, so it takes the singular verb “is.”',
        likelyReasoning:
          'Traces the verb back to the head noun “committee” past the intervening phrase and applies singular agreement.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          '“Are” agrees with the closer plural noun “proposals” instead of the actual subject “committee” — the classic intervening-phrase agreement trap.',
        likelyReasoning:
          'Matches the verb to the nearest noun because “proposals” sits right before the blank.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          '“Have been” is plural and introduces an unnecessary tense shift; it may sound formal but does not agree with the singular subject.',
        likelyReasoning:
          'Associates a more elaborate verb form with correctness on grammar questions.',
      },
      {
        optionId: 'C',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          '“Were” is both plural and the wrong tense given the future framing of “next Thursday.”',
        likelyReasoning:
          'Least defensible choice — wrong in both number and tense.',
      },
    ],
  },
];

export const SAT_READING_WRITING_QUESTIONS: Question[] = [
  ...loadOfficialQuestions(),
  ...ORIGINAL_PRACTICE_QUESTIONS,
];
