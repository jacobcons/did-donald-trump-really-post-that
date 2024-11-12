import { getUpperCaseWordsMessage, readJson } from './common.js';

const real = await readJson('./real-tweets.json');
const fake = await readJson('./fake-tweets.json');
for (let i = 0; i < Math.min(real.length, fake.length); i++) {
  if (real[i].match(/^\.+/)) {
    console.log(real[i]);
    console.log('---');
    console.log(fake[i]);
    console.log('---');
    console.log('\n');
    if (fake[i].length === 0) {
      console.log(fake[i]);
    }
  }
}