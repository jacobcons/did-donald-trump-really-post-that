import {
  chatCompletion,
  delay,
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

for (let i = 0; i < real.length; i++) {
  if (1) {
    console.log(fake[i]);
    console.log(i);
  }
}
