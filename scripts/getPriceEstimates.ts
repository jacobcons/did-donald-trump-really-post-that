import {
  SYSTEM_MESSAGE,
  SYSTEM_MESSAGE_TOKENS,
  TWEETS_PER_REQUEST,
} from './constants.js';
import { estimateTokens, getFilteredTweets } from './utils.js';

const { tweetsWithIndex } = await getFilteredTweets();

const TOTAL_NUMBER_OF_REQUESTS = Math.ceil(
  tweetsWithIndex.length / TWEETS_PER_REQUEST,
);

// calculate input token price
const totalUserMessageTokens = estimateTokens(tweetsWithIndex.join('\n'));
const totalSystemMessageTokens =
  SYSTEM_MESSAGE_TOKENS * TOTAL_NUMBER_OF_REQUESTS;
const totalInputTokens = totalUserMessageTokens + totalSystemMessageTokens;
const inputTokensPrice = calculatePrice(totalInputTokens, 2.5);

// calculate output token price
const totalOutputTokens = (6 * tweetsWithIndex.length) / 4;
const outputTokensPrice = calculatePrice(totalOutputTokens, 10);

function calculatePrice(tokens: number, pricePerMillion: number) {
  return (tokens * (pricePerMillion / 1000000)).toFixed(2);
}

console.log(inputTokensPrice, outputTokensPrice);
