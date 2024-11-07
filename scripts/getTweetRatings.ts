import tweetsJson from './tweets.json' with { type: 'json' };
import OpenAI from 'openai';
import clipboardy from 'clipboardy';
import * as fs from 'fs';
const openai = new OpenAI();
console.time();

type Tweet = {
  id: number;
  text: string;
  isRetweet: 't' | 'f'; // Assuming "t" represents true and "f" represents false
  isDeleted: 't' | 'f';
  device: string;
  favorites: number;
  retweets: number;
  date: string; // If needed, you could parse this into a Date object when using it
  isFlagged: 't' | 'f';
};
type StrippedTweet = {
  id: number;
  text: string;
  rating?: number;
};
const tweets = tweetsJson as Tweet[];

// PREPARE TWEETS
let filteredTweets: StrippedTweet[] = tweets
  .filter(
    (tweet) =>
      tweet.isRetweet === 'f' &&
      !tweet.text.includes('https') &&
      !tweet.text.includes('@'),
  )
  .sort((a, b) => b.favorites - a.favorites)
  .map((tweet) => ({ id: tweet.id, text: tweet.text }));
const tweetsWithIndex = filteredTweets.map((tweet, i) => `${i}. ${tweet.text}`);

// PRICING ESTIMATES
const SYSTEM_MESSAGE =
  "I'm making a game where users have to guess if a donald trump tweet is real or fake. You are given tweets and must rate them based on how good a candidate they are from 1 to 10. Good candidates will be any of crazy/outrageous/absurd/funny/insulting etc... The format must be EXACTLY <tweet-id>. <rating> for each tweet";
const SYSTEM_MESSAGE_TOKENS = SYSTEM_MESSAGE.length / 4;
const ROUGH_OUTPUT_TOKENS = 20;
const TWEETS_PER_REQUEST = 10;
const TOTAL_NUMBER_OF_REQUESTS = Math.ceil(
  tweetsWithIndex.length / TWEETS_PER_REQUEST,
);
function getPriceEstimates() {
  const totalUserMessageTokens = tweetsWithIndex.join('\n').length / 4;
  const totalSystemMessageTokens =
    SYSTEM_MESSAGE_TOKENS * TOTAL_NUMBER_OF_REQUESTS;
  const inputTokens = totalUserMessageTokens + totalSystemMessageTokens;
  const calculatePrice = (tokens: number, pricePerMillion: number) =>
    (tokens * (pricePerMillion / 1000000)).toFixed(2);
  const inputTokensPrice = calculatePrice(inputTokens, 2.5);
  const totalOutputTokens = (6 * tweetsWithIndex.length) / 4;
  const outputTokensPrice = calculatePrice(totalOutputTokens, 10);
  console.log(inputTokensPrice, outputTokensPrice);
}
// getPriceEstimates();

// PREPARE BATCHES OF TWEETS
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
    const tweetsForRequestTokens = tweetsForRequest.length / 4;
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

// GET RATINGS
console.log(`total batches ${batches.length - 1}`);
let promises = [];
for (let i = 5; i <= 10; i++) {
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.timeEnd();
