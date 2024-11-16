import { getUpperCaseWordsMessage, readJson, writeJSON } from './utils.js';

let [real, fake] = await Promise.all([
  readJson('./real-tweets.json'),
  readJson('./fake-tweets.json'),
]);

let s = 0;
for (let i = 0; i < Math.min(real.length, fake.length); i++) {
  s += real[i].length + fake[i].length;
}
console.log(s);
