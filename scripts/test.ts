import { getUpperCaseWordsMessage, readJson, writeJSON } from './utils.js';

let [real, fake] = await Promise.all([
  readJson('./real-tweets.json'),
  readJson('./fake-tweets.json'),
]);

for (let i = 0; i < Math.min(real.length, fake.length); i++) {
  if (getUpperCaseWordsMessage(real[i]) > 0) {
    console.log(
      getUpperCaseWordsMessage(real[i]),
      getUpperCaseWordsMessage(fake[i]),
    );
    console.log(real[i]);
    console.log(fake[i]);
    console.log('\n');
  }
}
