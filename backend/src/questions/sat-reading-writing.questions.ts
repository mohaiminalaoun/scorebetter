import type { Question } from './question.model';

const SOURCE_URL =
  'https://satsuite.collegeboard.org/media/pdf/digital-sat-sample-questions.pdf';
const DOCUMENT_TITLE = 'Digital SAT Sample Questions and Explanations';

/**
 * Official College Board practice questions with ScoreBetter-authored option
 * rankings and reasoning analysis. College Board supplies the correct answers
 * and explains each distractor, but does not rank the wrong answers. Treat each
 * primary-trap choice below as a hypothesis to validate with student sessions.
 *
 * Retain the source metadata and review College Board's reuse terms before
 * redistributing this material publicly.
 */
const OFFICIAL_QUESTIONS: Question[] = [
  {
    id: 'college-board-dsat-sample-rw-05',
    domain: 'Information and Ideas',
    skill: 'Inferences',
    source: {
      publisher: 'College Board',
      documentTitle: DOCUMENT_TITLE,
      url: SOURCE_URL,
      questionNumber: 'RW 5',
    },
    passage:
      'Many animals, including humans, must sleep, and sleep is known to have a role in everything from healing injuries to encoding information in long-term memory. But some scientists claim that, from an evolutionary standpoint, deep sleep for hours at a time leaves an animal so vulnerable that the known benefits of sleeping seem insufficient to explain why it became so widespread in the animal kingdom. These scientists therefore imply that ______',
    prompt: 'Which choice most logically completes the text?',
    options: [
      {
        id: 'A',
        text: 'it is more important to understand how widespread prolonged deep sleep is than to understand its function.',
      },
      {
        id: 'B',
        text: 'prolonged deep sleep is likely advantageous in ways that have yet to be discovered.',
      },
      {
        id: 'C',
        text: 'many traits that provide significant benefits for an animal also likely pose risks to that animal.',
      },
      {
        id: 'D',
        text: 'most traits perform functions that are hard to understand from an evolutionary standpoint.',
      },
    ],
    optionRanking: ['B', 'C', 'D', 'A'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          'It resolves the passage’s evolutionary puzzle: an extremely risky but widespread behavior likely has additional benefits that are not yet known.',
        likelyReasoning:
          'Connects the known benefits being insufficient with the need for an undiscovered evolutionary advantage.',
      },
      {
        optionId: 'C',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It echoes the passage’s benefit-versus-risk tension, but unsupportedly generalizes from sleep to many animal traits.',
        likelyReasoning:
          'Recognizes the central contrast but chooses a broad statement instead of completing the specific inference about sleep.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'It preserves the idea of an unexplained function but changes the subject from prolonged sleep to most traits.',
        likelyReasoning:
          'Keys in on scientific uncertainty while overlooking an unsupported universal claim.',
      },
      {
        optionId: 'A',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'It reverses the passage’s focus: how widespread sleep is is already stated, while why it persists is the unresolved issue.',
        likelyReasoning:
          'Confuses the observed prevalence of sleep with the evolutionary explanation the passage is seeking.',
      },
    ],
  },
  {
    id: 'college-board-dsat-sample-rw-09',
    domain: 'Craft and Structure',
    skill: 'Text Structure and Purpose',
    source: {
      publisher: 'College Board',
      documentTitle: DOCUMENT_TITLE,
      url: SOURCE_URL,
      questionNumber: 'RW 9',
    },
    passage:
      'Some studies have suggested that posture can influence cognition, but we should not overstate this phenomenon. A case in point: In a 2014 study, Megan O’Brien and Alaa Ahmed had subjects stand or sit while making risky simulated economic decisions. Standing is more physically unstable and cognitively demanding than sitting; accordingly, O’Brien and Ahmed hypothesized that standing subjects would display more risk aversion during the decision-making tasks than sitting subjects did, since they would want to avoid further feelings of discomfort and complicated risk evaluations. But O’Brien and Ahmed actually found no difference in the groups’ performance.',
    prompt: 'Which choice best states the main purpose of the text?',
    options: [
      {
        id: 'A',
        text: 'It presents the study by O’Brien and Ahmed to critique the methods and results reported in previous studies of the effects of posture on cognition.',
      },
      {
        id: 'B',
        text: 'It argues that research findings about the effects of posture on cognition are often misunderstood, as in the case of O’Brien and Ahmed’s study.',
      },
      {
        id: 'C',
        text: 'It explains a significant problem in the emerging understanding of posture’s effects on cognition and how O’Brien and Ahmed tried to solve that problem.',
      },
      {
        id: 'D',
        text: 'It discusses the study by O’Brien and Ahmed to illustrate why caution is needed when making claims about the effects of posture on cognition.',
      },
    ],
    optionRanking: ['D', 'B', 'C', 'A'],
    optionAnalysis: [
      {
        optionId: 'D',
        rank: 1,
        classification: 'correct',
        rationale:
          'It matches both the opening warning not to overstate the phenomenon and the study’s role as the supporting example.',
        likelyReasoning:
          'Uses the author’s explicit claim and identifies how the study functions in support of it.',
      },
      {
        optionId: 'B',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It sounds cautious and refers to the correct study, but the passage says claims may be overstated, not that findings are misunderstood.',
        likelyReasoning:
          'Substitutes a nearby idea—misinterpretation—for the passage’s actual warning about overgeneralization.',
      },
      {
        optionId: 'C',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'The study tests a hypothesis; it is not presented as solving a significant problem in an emerging field.',
        likelyReasoning:
          'Mistakes the study’s experimental setup for the author’s broader rhetorical purpose.',
      },
      {
        optionId: 'A',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'The passage neither analyzes methodological flaws nor directly critiques the methods or results of earlier studies.',
        likelyReasoning:
          'Infers a critique of previous research simply because the new study produced a different result.',
      },
    ],
  },
  {
    id: 'college-board-dsat-sample-rw-12',
    domain: 'Expression of Ideas',
    skill: 'Rhetorical Synthesis',
    source: {
      publisher: 'College Board',
      documentTitle: DOCUMENT_TITLE,
      url: SOURCE_URL,
      questionNumber: 'RW 12',
    },
    passage: `While researching a topic, a student has taken the following notes:
• Maika’i Tubbs is a Native Hawaiian sculptor and installation artist.
• His work has been shown in the United States, Canada, Japan, and Germany, among other places.
• Many of his sculptures feature discarded objects.
• His work Erasure (2008) includes discarded audiocassette tapes and magnets.
• His work Home Grown (2009) includes discarded pushpins, plastic plates and forks, and wood.`,
    prompt:
      'The student wants to emphasize a similarity between the two works. Which choice most effectively uses relevant information from the notes to accomplish this goal?',
    options: [
      {
        id: 'A',
        text: 'Erasure (2008) uses discarded objects such as audiocassette tapes and magnets; Home Grown (2009), however, includes pushpins, plastic plates and forks, and wood.',
      },
      {
        id: 'B',
        text: 'Like many of Tubbs’s sculptures, both Erasure and Home Grown include discarded objects: Erasure uses audiocassette tapes, and Home Grown uses plastic forks.',
      },
      {
        id: 'C',
        text: 'Tubbs’s work, which often features discarded objects, has been shown both within the United States and abroad.',
      },
      {
        id: 'D',
        text: 'Tubbs completed Erasure in 2008 and Home Grown in 2009.',
      },
    ],
    optionRanking: ['B', 'A', 'D', 'C'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          'It names both works and explicitly emphasizes their shared use of discarded objects.',
        likelyReasoning:
          'Selects relevant facts and organizes them around the exact rhetorical goal of similarity.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It uses relevant facts about both works, but “however” frames their materials as a contrast instead of emphasizing what they share.',
        likelyReasoning:
          'Prioritizes factual relevance while missing how the sentence’s transition changes its rhetorical effect.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'It mentions both works but merely reports their different completion years without establishing a meaningful similarity.',
        likelyReasoning:
          'Matches the required subjects but not the requested relationship between them.',
      },
      {
        optionId: 'C',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'It describes Tubbs’s work generally and never compares Erasure with Home Grown.',
        likelyReasoning:
          'Is distracted by the word “both,” even though it connects locations rather than the two named artworks.',
      },
    ],
  },
  {
    id: 'college-board-dsat-sample-rw-15',
    domain: 'Standard English Conventions',
    skill: 'Form, Structure, and Sense',
    source: {
      publisher: 'College Board',
      documentTitle: DOCUMENT_TITLE,
      url: SOURCE_URL,
      questionNumber: 'RW 15',
    },
    passage:
      'Rabinal Achí is a precolonial Maya dance drama performed annually in Rabinal, a town in the Guatemalan highlands. Based on events that occurred when Rabinal was a city-state ruled by a king, ______ had once been an ally of the king but was later captured while leading an invading force against him.',
    prompt:
      'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      {
        id: 'A',
        text: 'Rabinal Achí tells the story of K’iche’ Achí, a military leader who',
      },
      {
        id: 'B',
        text: 'K’iche’ Achí, the military leader in the story of Rabinal Achí,',
      },
      {
        id: 'C',
        text: 'there was a military leader, K’iche’ Achí, who in Rabinal Achí',
      },
      {
        id: 'D',
        text: 'the military leader whose story is told in Rabinal Achí, K’iche’ Achí,',
      },
    ],
    optionRanking: ['A', 'B', 'D', 'C'],
    optionAnalysis: [
      {
        optionId: 'A',
        rank: 1,
        classification: 'correct',
        rationale:
          'It places the title Rabinal Achí immediately after the introductory modifier, so the drama is correctly described as being based on historical events.',
        likelyReasoning:
          'Checks which noun the opening modifier logically describes before evaluating the rest of the sentence.',
      },
      {
        optionId: 'B',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'It creates a smooth-looking sentence, but it illogically makes the person K’iche’ Achí the thing that is “based on events.”',
        likelyReasoning:
          'Relies on surface fluency and overlooks the dangling introductory modifier.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'Like B, it makes a person rather than the drama the subject modified by “Based on events,” while adding a distracting descriptive phrase.',
        likelyReasoning:
          'Notices that the option identifies the story’s military leader but does not test the modifier against the grammatical subject.',
      },
      {
        optionId: 'C',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'The existential construction leaves the introductory modifier without the drama as its logical subject and produces an awkward, incoherent completion.',
        likelyReasoning:
          'Focuses on preserving all the passage’s facts without checking sentence structure or modifier placement.',
      },
    ],
  },
];

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
  ...OFFICIAL_QUESTIONS,
  ...ORIGINAL_PRACTICE_QUESTIONS,
];
