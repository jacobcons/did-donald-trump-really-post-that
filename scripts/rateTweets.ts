import OpenAI from 'openai';
import * as fs from 'fs';
import { delay, estimateTokens, getFilteredTweets, readJSON } from './utils.js';
import {
  ROUGH_OUTPUT_TOKENS,
  SYSTEM_MESSAGE,
  SYSTEM_MESSAGE_TOKENS,
  TWEETS_PER_REQUEST,
} from './constants.js';
const openai = new OpenAI();

console.time();
// get tweets with features that are easiest to generate with llm
const { filteredTweets, tweetsWithIndex } = await getFilteredTweets();

// prepare batches of tweets to be sent off to llm in maximum possible group size whilst avoiding rate limits
let i = 0;
let batches: { batch: string[]; start: number; end: number }[] = [];
while (i < tweetsWithIndex.length) {
  let tokensInBatch = 0;
  let batch: string[] = [];
  const start = i;
  let endIndex;
  while (i < tweetsWithIndex.length) {
    const tweetsForRequest = tweetsWithIndex
      .slice(i, i + TWEETS_PER_REQUEST)
      .join('\n');
    const tweetsForRequestTokens = estimateTokens(tweetsForRequest);
    tokensInBatch +=
      tweetsForRequestTokens + SYSTEM_MESSAGE_TOKENS + ROUGH_OUTPUT_TOKENS;
    if (tokensInBatch < 20000) {
      batch.push(tweetsForRequest);
      i += TWEETS_PER_REQUEST;
    } else {
      break;
    }
  }
  batches.push({
    batch,
    start,
    end: i,
  });
}

// send prepared batches of tweets off to llm to get rating for how good a candidate the tweet is for the game
// write the results to individual json files for collation later
console.log(`total batches ${batches.length - 1}`);
let promises = [];
for (let i = 5; i <= batches.length - 1; i++) {
  console.time('batch');
  console.log(`starting batch ${i}`);
  const { batch, start, end } = batches[i];
  const batchPromises = batch.map((tweetsForRequest) =>
    fetchAndWriteRatings(tweetsForRequest),
  );
  await Promise.all(batchPromises);
  const batchWithRatings = JSON.stringify(filteredTweets.slice(start, end));
  await fs.writeFileSync(`./batches/${i}.json`, batchWithRatings);
  console.log(`finished batch ${i}`);
  console.timeEnd('batch');
  await delay(61000);
}

async function fetchAndWriteRatings(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: userMessage },
    ],
  });
  const response = completion.choices[0].message.content as string;

  for (const line of response.split('\n')) {
    const [firstPart, secondPart] = line.split('. ');
    const id = +firstPart;
    const rating = +secondPart;
    filteredTweets[id].rating = rating;
  }
}
console.timeEnd();
