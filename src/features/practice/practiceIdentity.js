export const PRACTICE_IDENTITY_VERSION = 1;
const ID_PREFIX = `practice-question:v${PRACTICE_IDENTITY_VERSION}`;

const nullableString = value =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export function getCatalogId(topicId) {
  return topicId.startsWith('cat-git') ? 'git' : 'javascript';
}

export function createQuestionIdentity({ catalogId, topicId, questionId }) {
  if (![catalogId, topicId, questionId].every(value => typeof value === 'string' && value.length > 0)) {
    throw new Error('Practice question identity requires catalogId, topicId, and questionId.');
  }
  return `${ID_PREFIX}:${encodeURIComponent(catalogId)}:${encodeURIComponent(topicId)}:${encodeURIComponent(questionId)}`;
}

export function buildPracticeCatalog(modules) {
  const identities = new Map();
  const questionsById = new Map();
  const moduleIds = new Set();
  const issues = [];

  if (!Array.isArray(modules)) {
    return { valid: false, issues: [{ type: 'invalid-catalog', message: 'Practice catalog must be an array.' }], identities, questionsById };
  }

  modules.forEach((module, moduleIndex) => {
    if (!module || typeof module.id !== 'string' || !module.id) {
      issues.push({ type: 'invalid-topic', moduleIndex });
      return;
    }
    if (moduleIds.has(module.id)) issues.push({ type: 'duplicate-topic-id', topicId: module.id });
    moduleIds.add(module.id);
    if (!Array.isArray(module.questions)) {
      issues.push({ type: 'invalid-question-list', topicId: module.id });
      return;
    }

    module.questions.forEach((question, questionIndex) => {
      if (!question || typeof question.id !== 'string' || !question.id) {
        issues.push({ type: 'invalid-question', topicId: module.id, questionIndex });
        return;
      }
      const descriptor = {
        catalogId: getCatalogId(module.id),
        topicId: module.id,
        questionId: question.id
      };
      descriptor.identity = createQuestionIdentity(descriptor);
      if (identities.has(descriptor.identity)) {
        issues.push({ type: 'duplicate-question-identity', identity: descriptor.identity });
      }
      identities.set(descriptor.identity, descriptor);
      const matches = questionsById.get(question.id) ?? [];
      matches.push(descriptor);
      questionsById.set(question.id, matches);
    });
  });

  for (const [questionId, matches] of questionsById) {
    if (matches.length > 1) {
      issues.push({
        type: 'ambiguous-legacy-question-id',
        questionId,
        identities: matches.map(match => match.identity)
      });
    }
  }

  return { valid: issues.length === 0, issues, identities, questionsById };
}

export function classifyPracticeRecord(record, catalog) {
  const declared = {
    catalogId: nullableString(record?.catalogId),
    topicId: nullableString(record?.topicId),
    questionId: nullableString(record?.questionId)
  };

  if (declared.catalogId && declared.topicId && declared.questionId) {
    const identity = createQuestionIdentity(declared);
    if (catalog.identities.has(identity)) {
      return { status: 'canonical', identity, descriptor: catalog.identities.get(identity), record };
    }
    return { status: 'stale', reason: 'declared-question-not-in-catalog', identity, record };
  }

  const suffixMatches = [];
  for (const [questionId, descriptors] of catalog.questionsById) {
    if (typeof record?.id === 'string' && record.id.endsWith(`_${questionId}`)) {
      suffixMatches.push({ questionId, descriptors });
    }
  }
  const longestQuestionIdLength = Math.max(0, ...suffixMatches.map(match => match.questionId.length));
  const matches = suffixMatches
    .filter(match => match.questionId.length === longestQuestionIdLength)
    .flatMap(match => match.descriptors);
  if (matches.length === 1) {
    return { status: 'legacy-unambiguous', identity: matches[0].identity, descriptor: matches[0], record };
  }
  if (matches.length > 1) {
    return { status: 'legacy-ambiguous', reason: 'question-id-matches-multiple-catalog-entries', candidates: matches, record };
  }
  return { status: 'stale', reason: 'question-not-found', record };
}

export function getQuestionSolvedState(records, descriptor, catalog) {
  const identity = createQuestionIdentity(descriptor);
  const classified = records.map(record => classifyPracticeRecord(record, catalog));
  const canonical = classified.filter(item => item.status === 'canonical' && item.identity === identity);
  const relevant = canonical.length > 0
    ? canonical
    : classified.filter(item => item.status === 'legacy-unambiguous' && item.identity === identity);
  return relevant.some(item => item.record.completed === true);
}

export function summarizePracticeRecords(records, catalog) {
  return records.reduce((summary, record) => {
    const result = classifyPracticeRecord(record, catalog);
    summary[result.status] = (summary[result.status] ?? 0) + 1;
    return summary;
  }, {});
}
