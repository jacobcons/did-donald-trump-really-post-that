import {
  chatCompletion,
  delay,
  fractionOfUpperCaseWords,
  readJSON,
  upperCaseWordsStats,
  writeJSON,
} from './utils.js';
import fs from 'fs/promises';
import dedent from 'dedent';

let [real, fake] = await Promise.all([
  readJSON('./real-tweets.json'),
  readJSON('./fake-tweets.json'),
]);

let i = 0;
const realIds = new Set();
for (const file of await fs.readdir('./tts/audio/real')) {
  const id = file.split('.')[0];
  realIds.add(+id);
}
console.log(real.every((t) => realIds.has(t.id)));

const fakeIds = new Set();
for (const file of await fs.readdir('./tts/audio/fake')) {
  const id = file.split('.')[0];
  fakeIds.add(id);
}
console.log(fake.every((t) => fakeIds.has(t.id)));
