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
