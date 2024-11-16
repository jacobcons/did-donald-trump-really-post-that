import { getUpperCaseWordsMessage, readJSON, writeJSON } from './utils.js';

let [real, fake] = await Promise.all([
  readJSON('./real-tweets.json'),
  readJSON('./fake-tweets.json'),
]);

let s = 0;
for (let i = 0; i < Math.min(real.length, fake.length); i++) {
  console.log(real[i]);
  console.log(fake[i]);
  console.log('\n');
}
console.log(s);
