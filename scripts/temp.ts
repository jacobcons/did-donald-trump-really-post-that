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

// for (const file of await fs.readdir('./tts/audio/real')) {
//   const id = file.split('.')[0];
//   const tweet = real.find((t) => t.id === +id);
//   console.log(id);
//   console.log(tweet.text, '\n');
// }
//
// for (const file of await fs.readdir('./tts/audio/fake')) {
//   const id = file.split('.')[0];
//   const tweet = fake.find((t) => t.id === id);
//   console.log(id);
//   console.log(tweet.text, '\n');
// }

for (let i = 0; i < real.length; i++) {
  if (fake[i].text.includes('"')) {
    console.log(JSON.stringify(fake[i]));
    console.log(i);
  }
}
