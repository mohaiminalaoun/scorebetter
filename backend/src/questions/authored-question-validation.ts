import type {
  GradableQuestion,
  OptionAnalysis,
  OptionClassification,
  ReadingWritingDomain,
} from './question.model';

const READING_WRITING_DOMAINS = new Set<ReadingWritingDomain>([
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
]);

const CLASSIFICATION_BY_RANK: Record<1 | 2 | 3 | 4, OptionClassification> = {
  1: 'correct',
  2: 'primary-trap',
  3: 'secondary-distractor',
  4: 'weak-distractor',
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates an untrusted, client-supplied question object (an "authored
 * question" imported by a user) against the same shape and internal
 * consistency rules a bank question must satisfy. Shared by the frontend
 * (validating a JSON import before it ever reaches the server) and the
 * backend (validating it again on submit, since a client can't be trusted).
 * Framework-agnostic: throws a plain `Error` so each caller can wrap it in
 * whatever error type its runtime expects.
 */
export function validateAuthoredQuestion(candidate: unknown): GradableQuestion {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('must be an object');
  }

  const q = candidate as Record<string, unknown>;

  if (!isNonEmptyString(q.id)) {
    throw new Error('id must be a nonempty string');
  }
  if (!isNonEmptyString(q.prompt)) {
    throw new Error('prompt must be a nonempty string');
  }
  if (q.passage !== undefined && typeof q.passage !== 'string') {
    throw new Error('passage must be a string when provided');
  }
  if (
    !isNonEmptyString(q.domain) ||
    !READING_WRITING_DOMAINS.has(q.domain as ReadingWritingDomain)
  ) {
    throw new Error('domain must be a supported SAT Reading/Writing domain');
  }
  if (!isNonEmptyString(q.skill)) {
    throw new Error('skill must be a nonempty string');
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error('options must be an array of 4 objects');
  }
  if (!Array.isArray(q.optionRanking) || q.optionRanking.length !== 4) {
    throw new Error('optionRanking must be an array of 4 option IDs');
  }
  if (!Array.isArray(q.optionAnalysis) || q.optionAnalysis.length !== 4) {
    throw new Error('optionAnalysis must be an array of 4 objects');
  }

  const options = q.options.map((option, index) => {
    if (!option || typeof option !== 'object') {
      throw new Error(`options[${index}] must be an object`);
    }
    const value = option as Record<string, unknown>;
    if (!isNonEmptyString(value.id)) {
      throw new Error(`options[${index}].id must be a nonempty string`);
    }
    if (!isNonEmptyString(value.text)) {
      throw new Error(`options[${index}].text must be a nonempty string`);
    }
    return { id: value.id, text: value.text };
  });

  const optionIds = new Set(options.map((option) => option.id));
  if (optionIds.size !== 4) {
    throw new Error('option IDs must be unique');
  }

  const optionRanking = q.optionRanking.map((value, index) => {
    if (!isNonEmptyString(value) || !optionIds.has(value)) {
      throw new Error(`optionRanking[${index}] must reference an option`);
    }
    return value;
  });
  if (new Set(optionRanking).size !== 4) {
    throw new Error('optionRanking must contain each option ID exactly once');
  }

  const optionAnalysis = q.optionAnalysis.map((analysis, index) => {
    if (!analysis || typeof analysis !== 'object') {
      throw new Error(`optionAnalysis[${index}] must be an object`);
    }

    const value = analysis as Record<string, unknown>;
    const rank = value.rank;
    if (!isNonEmptyString(value.optionId) || !optionIds.has(value.optionId)) {
      throw new Error(`optionAnalysis[${index}].optionId must reference an option`);
    }
    if (rank !== 1 && rank !== 2 && rank !== 3 && rank !== 4) {
      throw new Error(`optionAnalysis[${index}].rank must be 1, 2, 3, or 4`);
    }
    if (value.optionId !== optionRanking[rank - 1]) {
      throw new Error(`optionAnalysis[${index}] does not match optionRanking`);
    }
    if (value.classification !== CLASSIFICATION_BY_RANK[rank]) {
      throw new Error(
        `optionAnalysis[${index}].classification does not match rank ${rank}`,
      );
    }
    if (!isNonEmptyString(value.rationale)) {
      throw new Error(`optionAnalysis[${index}].rationale must be a nonempty string`);
    }
    if (!isNonEmptyString(value.likelyReasoning)) {
      throw new Error(
        `optionAnalysis[${index}].likelyReasoning must be a nonempty string`,
      );
    }

    return {
      optionId: value.optionId,
      rank,
      classification: value.classification,
      rationale: value.rationale,
      likelyReasoning: value.likelyReasoning,
    } as OptionAnalysis;
  });

  if (new Set(optionAnalysis.map((analysis) => analysis.optionId)).size !== 4) {
    throw new Error('optionAnalysis must cover each option exactly once');
  }

  return {
    id: q.id,
    prompt: q.prompt,
    ...(q.passage !== undefined ? { passage: q.passage } : {}),
    options,
    domain: q.domain as ReadingWritingDomain,
    skill: q.skill,
    optionRanking: optionRanking as GradableQuestion['optionRanking'],
    optionAnalysis: optionAnalysis as GradableQuestion['optionAnalysis'],
  };
}
