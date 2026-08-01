import jsTopicPractice from '../../data/jsTopicPractice.json';
import { buildPracticeCatalog } from './practiceIdentity';

export const practiceModules = jsTopicPractice;
export const practiceCatalog = buildPracticeCatalog(practiceModules);

if (!practiceCatalog.valid) {
  throw new Error(`Invalid static Practice catalog: ${JSON.stringify(practiceCatalog.issues)}`);
}
