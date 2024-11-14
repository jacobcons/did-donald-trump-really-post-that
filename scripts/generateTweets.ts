import fs from 'fs/promises';
import OpenAI from 'openai';
import realTweets from './real-tweets.json' with { type: 'json' };
import {
  delay,
  getUpperCaseWordsMessage,
  readJson,
  shuffleArray,
  writeJSON,
} from './utils.js';
import topics from './topics.json' with { type: 'json' };
const openai = new OpenAI();
import nlp from 'compromise';

type Prompt = {
  userMessage: string;
  systemMessage: string;
};
const prompts: Prompt[] = [];
for (const tweet of realTweets) {
  const length = tweet.length;
  const uppercaseWordsMessage = getUpperCaseWordsMessage(tweet);
  const totalNumbers = getTotalNumbers(tweet);
  const totalHashtags = tweet.split('').filter((char) => char === '#').length;

  const doc = nlp(tweet);
  const people = doc.people().out('array');
  const peopleMessage = people.length
    ? ` It should be about ${people.join(', ')}, make it specific about those people.`
    : '';

  const randomTopic = topics[Math.floor(Math.random() ** 2 * topics.length)];
  const topicMessage =
    !people.length && Math.random() < 0.8
      ? ` It should be about ${randomTopic}`
      : '';

  const beginningDots = tweet.match(/^(\.+)/);
  const totalBeginningDots = beginningDots ? beginningDots[1].length : 0;
  const beginningDotsMessage = totalBeginningDots
    ? ` It should start with ${totalBeginningDots} dots.`
    : '';

  const endingDots = tweet.match(/(\.+)$/);
  const totalEndingDots = endingDots ? endingDots[1].length : 0;
  const endingDotsMessage =
    totalEndingDots > 1 ? ` It should end with ${totalEndingDots} dots.` : '';

  const ampersandMessage = tweet.includes('&amp;')
    ? ` It should include & symbol.`
    : '';

  const makeExtraFunnyMessage =
    Math.random() < 0.8
      ? " Make it funny but not so funny/absurd that it's obvious it's fake."
      : '';
  const capitalizeWordsInARowMessage =
    uppercaseWordsMessage === 'all' || uppercaseWordsMessage >= 5
      ? '(sometimes you should capitalize lots of words in a row)'
      : '';

  const systemMessage = `I'm making a game where users have to guess whether a donald trump tweet is real or fake. You will generate a fake donald trump tweet in his style of speaking (it must be from before 2021 February)${makeExtraFunnyMessage}`;
  const userMessage = `It should have roughly ${length} characters, ${uppercaseWordsMessage} words should be in all capitals${capitalizeWordsInARowMessage}, have ${totalHashtags} hashtags, have ${totalNumbers} numbers. Think about the huge list of possible topics you could tweet about.${peopleMessage}${beginningDotsMessage}${endingDotsMessage}${topicMessage}${ampersandMessage}
  
  Step 1 - reiterate number of rough characters, number of words in all capitals, number of hashtags, number of numbers

  Step 2 - generate tweet according to criteria of previous step

  Output format -
  Step 1 - ...
  Step 2 - "<tweet>"`;

  prompts.push({ systemMessage, userMessage });
}

function getTotalNumbers(text: string) {
  const numbers = text.match(/((\d+,)+\d+|\d+)/g);
  return numbers ? numbers.length : 0;
}

const REQUESTS_PER_MINUTE = 80;
const TOTAL_REQUESTS = prompts.length;
const newTweets = [];
for (let i = 0; i < TOTAL_REQUESTS; i += REQUESTS_PER_MINUTE) {
  console.log(`starting i=${i}`);
  const promptBatch = prompts.slice(i, i + REQUESTS_PER_MINUTE);
  const newTweetBatch = await Promise.all(
    promptBatch.map((prompt) => generateTweet(prompt)),
  );
  newTweets.push(...newTweetBatch);
  console.log(`ending i=${i}`);
  if (i + REQUESTS_PER_MINUTE < TOTAL_REQUESTS) {
    await delay(61000);
  }
}

await Promise.all([
  fs.writeFile('./fake-tweets.json', JSON.stringify(newTweets)),
  fs.writeFile(
    '../frontend/src/data/fake-tweets.json',
    JSON.stringify(newTweets),
  ),
]);

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
