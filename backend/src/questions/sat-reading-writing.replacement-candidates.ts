import type { Question } from './question.model';

/**
 * Original replacements approved through human review and included in the
 * canonical runtime bank.
 */
export const ORIGINAL_REPLACEMENT_CANDIDATES: Question[] = [
  // Intended difficulty: medium-hard.
  // Research grounding (not a wording source):
  // https://pmc.ncbi.nlm.nih.gov/articles/PMC2633839/
  {
    id: 'scorebetter-candidate-rw-inferences-smoke-cues-01',
    domain: 'Information and Ideas',
    skill: 'Inferences',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'By clearing mature vegetation, a wildfire can temporarily give new seedlings greater access to light and space. Seeds of certain plants in fire-prone environments often germinate soon after such fires. Researchers once suspected that intense heat was the main trigger. In field experiments, however, applying cooled smoke to unheated soil sharply increased the number and variety of seedlings that emerged. Scientists later isolated karrikins, compounds in smoke that stimulate germination without heating the seeds. These findings suggest that ______',
    prompt: 'Which choice most logically completes the text?',
    options: [
      {
        id: 'A',
        text: 'karrikins likely nourish dormant seeds after a fire until the surrounding vegetation begins growing again.',
      },
      {
        id: 'B',
        text: 'plants whose seeds respond to smoke are most likely to germinate while a wildfire is still burning.',
      },
      {
        id: 'C',
        text: 'sensitivity to smoke-borne chemicals may help some plants time their germination so that it occurs under favorable postfire conditions.',
      },
      {
        id: 'D',
        text: 'heat and karrikins must act together before seeds in fire-prone environments can germinate.',
      },
    ],
    optionRanking: ['C', 'A', 'D', 'B'],
    optionAnalysis: [
      {
        optionId: 'C',
        rank: 1,
        classification: 'correct',
        rationale:
          'The smoke-derived cue can trigger germination without heat, and responding after vegetation has been cleared would let seedlings emerge when competition for light and space is temporarily reduced.',
        likelyReasoning:
          'Combines the ecological opportunity described at the start with the evidence that seeds can detect a chemical product of fire.',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'The experiments establish karrikins as signals that initiate germination, not as food that sustains seeds, and the passage never says the seeds lack nutrients.',
        likelyReasoning:
          'Recognizes that karrikins benefit germination but mistakes the cue for a nutritional resource supplied to the seed.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'Cooled smoke and isolated karrikins stimulated unheated seeds, so the evidence specifically shows that heat is not always required alongside the chemical cue.',
        likelyReasoning:
          'Keeps part of the researchers’ original heat hypothesis instead of revising it in light of the unheated experiments.',
      },
      {
        optionId: 'B',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'The passage describes germination after fires have cleared vegetation; it offers no evidence that seeds respond quickly enough to emerge during an active fire.',
        likelyReasoning:
          'Confuses using smoke as a sign of recent fire with germinating during the dangerous event itself.',
      },
    ],
  },

  // Intended difficulty: medium-hard.
  // Research grounding (not a wording source):
  // https://www.cam.ac.uk/stories/merlin-manuscript-discovered-cambridge
  {
    id: 'scorebetter-candidate-rw-text-purpose-manuscript-01',
    domain: 'Craft and Structure',
    skill: 'Text Structure and Purpose',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'A manuscript can preserve evidence that ordinary visual inspection misses. When conservators examined a medieval story reused centuries ago as part of a bookbinding, much of its writing appeared faded or erased. They photographed the pages under several wavelengths of light and combined the resulting images. The processed images made portions of the story readable again and exposed an ownership mark that could not be seen with the unaided eye. Together, these details helped scholars better understand both the text and the manuscript’s later history.',
    prompt: 'Which choice best states the main purpose of the text?',
    options: [
      {
        id: 'A',
        text: 'It compares the historical importance of a medieval story with that of the bookbinding in which the story was later found.',
      },
      {
        id: 'B',
        text: 'It describes the technical steps conservators must follow to combine photographs made with different wavelengths of light.',
      },
      {
        id: 'C',
        text: 'It argues that scholars should stop relying on visual inspection when they study the history of medieval manuscripts.',
      },
      {
        id: 'D',
        text: 'It uses a manuscript investigation to show how multispectral imaging can reveal evidence that changes scholars’ understanding of an object.',
      },
    ],
    optionRanking: ['D', 'B', 'C', 'A'],
    optionAnalysis: [
      {
        optionId: 'D',
        rank: 1,
        classification: 'correct',
        rationale:
          'The passage presents one investigation as an example of imaging recovering hidden textual and ownership evidence that improved historical interpretation.',
        likelyReasoning:
          'Connects the opening claim about missed evidence to the function of every detail in the example that follows.',
      },
      {
        optionId: 'B',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'The text briefly mentions photographing and combining images, but it does not explain a procedure in enough detail to function as technical instructions.',
        likelyReasoning:
          'Mistakes the method used in the example for the author’s broader purpose in presenting the example.',
      },
      {
        optionId: 'C',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'The passage shows that unaided inspection can miss evidence; it never claims that visual inspection has no value or should be abandoned.',
        likelyReasoning:
          'Converts a limited caution about one method into an absolute recommendation against using that method.',
      },
      {
        optionId: 'A',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'The story and the binding are not evaluated against each other; the binding context simply explains why the manuscript had been reused and obscured.',
        likelyReasoning:
          'Notices two historical stages in the object’s life and assumes the passage is comparing their importance.',
      },
    ],
  },

  // Intended difficulty: medium. The buildings and designers are fictional.
  {
    id: 'scorebetter-candidate-rw-rhetorical-synthesis-cooling-01',
    domain: 'Expression of Ideas',
    skill: 'Rhetorical Synthesis',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage: `While researching a topic, a student has taken the following notes:
• Architect Lina Mbeki designed the Eastgate Learning Center, completed in 2018.
• The center's central courtyard allows warm air to rise and exit through openings near the roof.
• Brick screens shade the center's windows.
• Architect Tomás Ibarra designed the Riverbend Library, completed in 2021.
• The library's ventilation chimneys draw warm air upward and release it outside.
• Timber louvers shade the library's windows.`,
    prompt:
      'The student wants to emphasize a similarity in how the two buildings stay cool. Which choice most effectively uses relevant information from the notes to accomplish this goal?',
    options: [
      {
        id: 'A',
        text: 'Completed in 2018, the Eastgate Learning Center was designed by Lina Mbeki, while Tomás Ibarra’s Riverbend Library was completed in 2021.',
      },
      {
        id: 'B',
        text: 'Both the Eastgate Learning Center and the Riverbend Library use rising warm air to move heat out of the building.',
      },
      {
        id: 'C',
        text: 'The Riverbend Library uses ventilation chimneys and timber louvers to help keep the building cool.',
      },
      {
        id: 'D',
        text: 'The Eastgate Learning Center uses brick screens; the Riverbend Library, however, uses timber louvers.',
      },
    ],
    optionRanking: ['B', 'D', 'A', 'C'],
    optionAnalysis: [
      {
        optionId: 'B',
        rank: 1,
        classification: 'correct',
        rationale:
          'It identifies the shared cooling principle: both designs channel naturally rising warm air out of the building.',
        likelyReasoning:
          'Selects one relevant mechanism from each building and states the common relationship between them.',
      },
      {
        optionId: 'D',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'Both facts concern cooling, but “however” emphasizes the difference in shading materials instead of the requested similarity.',
        likelyReasoning:
          'Uses relevant details about both buildings but overlooks how the transition frames their relationship.',
      },
      {
        optionId: 'A',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'It accurately identifies the designers and dates, but those details do not explain a similarity in how the buildings stay cool.',
        likelyReasoning:
          'Includes both buildings and parallel facts without testing those facts against the student’s specific rhetorical goal.',
      },
      {
        optionId: 'C',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'It describes cooling features of only the Riverbend Library and therefore cannot establish a similarity between the two buildings.',
        likelyReasoning:
          'Focuses on a clearly relevant cooling detail but omits the comparison required by the prompt.',
      },
    ],
  },

  // Intended difficulty: hard. The astronomer and catalog are fictional.
  {
    id: 'scorebetter-candidate-rw-modifier-catalog-01',
    domain: 'Standard English Conventions',
    skill: 'Form, Structure, and Sense',
    source: {
      publisher: 'ScoreBetter',
      origin: 'original-practice',
      authoredBy: 'ai-draft',
    },
    passage:
      'Astronomer Leila Okafor spent three decades gathering measurements of variable stars. Compiled from observations made at fourteen observatories, ______ identifies recurring brightness changes in more than six hundred stars.',
    prompt:
      'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      {
        id: 'A',
        text: 'Okafor, who created a new catalog,',
      },
      {
        id: 'B',
        text: 'the fourteen observatories represented in Okafor’s new catalog',
      },
      { id: 'C', text: 'Okafor’s new catalog' },
      {
        id: 'D',
        text: 'there is a new catalog by Okafor that',
      },
    ],
    optionRanking: ['C', 'A', 'D', 'B'],
    optionAnalysis: [
      {
        optionId: 'C',
        rank: 1,
        classification: 'correct',
        rationale:
          'The introductory modifier logically describes the catalog, which was compiled from observations, and the singular subject “catalog” agrees with “identifies.”',
        likelyReasoning:
          'Checks both what was compiled and which noun performs the verb “identifies.”',
      },
      {
        optionId: 'A',
        rank: 2,
        classification: 'primary-trap',
        rationale:
          'The sentence is superficially fluent, but the opening modifier would illogically describe Okafor herself as being compiled from observations.',
        likelyReasoning:
          'Chooses the clearly identified person as the subject without testing whether the modifier can logically describe that person.',
      },
      {
        optionId: 'D',
        rank: 3,
        classification: 'secondary-distractor',
        rationale:
          'The existential construction leaves “Compiled from observations” without a logical noun to modify, even though the later relative clause can attach to “catalog.”',
        likelyReasoning:
          'Focuses on the nearby phrase “catalog by Okafor” and overlooks that “there” cannot be the thing compiled.',
      },
      {
        optionId: 'B',
        rank: 4,
        classification: 'weak-distractor',
        rationale:
          'Observatories are not compiled from observations, and the plural subject “observatories” does not agree with the singular verb “identifies.”',
        likelyReasoning:
          'Matches the modifier to a repeated noun from the sentence while missing both the logical and subject-verb agreement problems.',
      },
    ],
  },
];
