import fs from 'fs';
import OpenAI from 'openai';
import highlyRatedTweets from './real-tweets.json' with { type: 'json' };
import { delay, readJson } from './common.js';
const openai = new OpenAI();

type Prompt = {
  userMessage: string;
  systemMessage: string;
};
const PROBABILITY_TO_MAKE_EXTRA_FUNNY = 0.5;
const prompts: Prompt[] = [];
for (const tweet of highlyRatedTweets) {
  const length = tweet.length;

  const uppercaseWords = tweet.match(/\b(?!I\b)([A-Z]+)\b/g);
  const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
  const words = tweet.match(/\b([a-zA-Z]+)\b/g);
  const totalWords = words ? words.length : 0;
  const isAllUppercaseWords = totalUppercaseWords / totalWords === 1;
  const uppercaseWordsMessage = isAllUppercaseWords
    ? 'all'
    : totalUppercaseWords;

  const numbers = tweet.match(/((\d+,)+\d+|\d+)/g);
  const totalNumbers = numbers ? numbers.length : 0;

  const totalHashtags = tweet.split('').filter((char) => char === '#').length;

  const systemMessage = `I'm making a game where users have to guess whether a donald trump tweet is real or fake. You will generate a fake donald trump tweet in his style of speaking (it must be from before 2021 February)${Math.random() < PROBABILITY_TO_MAKE_EXTRA_FUNNY ? " Make it funny but not so funny/absurd that it's obvious it's fake." : ''}`;
  const userMessage = `It should have roughly ${length} characters, ${uppercaseWordsMessage} words should be in all capitals, have ${totalHashtags} hashtags, have ${totalNumbers} numbers. Think about the huge list of possible topics you could tweet about
  
  Step 1 - reiterate number of rough characters, words in all capitals, hashtags, numbers

  Step 2 - generate tweet according to criteria of previous step

  Output format -
  Step 1 - ...
  Step 2 - "<tweet>"`;
  prompts.push({ systemMessage, userMessage });
}

function countUpperCase(text: string) {
  const uppercaseWords = text.match(/\b(?!I\b)([A-Z]+)\b/g);
  const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
  const words = text.match(/\b([a-zA-Z]+)\b/g);
  const totalWords = words ? words.length : 0;
  const isAllUppercaseWords = totalUppercaseWords / totalWords === 1;
  const uppercaseWordsMessage = isAllUppercaseWords
    ? 'all'
    : totalUppercaseWords;
  return uppercaseWordsMessage;
}

const real = await readJson('./real-tweets.json');
const fake = await readJson('./fake-tweets.json');
for (let i = 0; i < real.length; i++) {
  console.log(real[i]);
  console.log('---');
  console.log(fake[i]);
  console.log('---');
  console.log(countUpperCase(real[i]), countUpperCase(fake[i]));
}

// const REQUESTS_PER_MINUTE = 80;
// const TOTAL_REQUESTS = prompts.length;
// const newTweets = [];
// for (let i = 0; i < TOTAL_REQUESTS; i += REQUESTS_PER_MINUTE) {
//   console.log(`starting i=${i}`);
//   const promptBatch = prompts.slice(i, i + REQUESTS_PER_MINUTE);
//   const newTweetBatch = await Promise.all(
//     promptBatch.map((prompt) => generateTweet(prompt)),
//   );
//   newTweets.push(...newTweetBatch);
//   console.log(`ending i=${i}`);
//   if (i + REQUESTS_PER_MINUTE < TOTAL_REQUESTS) {
//     await delay(61000);
//   }
// }
//
// fs.writeFileSync('./fake-tweets.json', JSON.stringify(newTweets));

async function generateTweet({ systemMessage, userMessage }: Prompt) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      { role: 'user', content: userMessage },
    ],
  });

  const res = completion.choices[0].message.content as string;
  const newTweet = res.split('\n\n').at(-1);
  const match = newTweet.match(/Step 2 - "(.+)"/);
  return match ? match[1] : '';
}
