import {
  chatCompletion,
  delay,
  getUpperCaseWordsMessage,
  readJSON,
  writeJSON,
} from './utils.js';
import fs from 'fs/promises';
import dedent from 'dedent';

let [real, fake] = await Promise.all([
  readJSON('./real-tweets.json'),
  readJSON('./fake-tweets.json'),
]);

for (let i = 0; i < real.length; i++) {
  if (fake[i].id === '55a19226-e930-48d8-9de6-6b48487be4fd') {
    console.log(fake[i].text);
  }
}
