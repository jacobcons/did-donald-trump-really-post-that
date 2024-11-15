import { getUpperCaseWordsMessage, readJson, writeJSON } from './utils.js';

let fake = await readJson('./fake-tweets.json');
fake = fake.filter((t) => t !== '');
await writeJSON('./fake-tweets.json', fake);
