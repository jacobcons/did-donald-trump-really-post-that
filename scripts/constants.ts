import {estimateTokens} from './utils.js';

export const SYSTEM_MESSAGE =
  "I'm making a game where users have to guess if a donald trump tweet is real or fake. You are given tweets and must rate them based on how good a candidate they are from 1 to 10. Good candidates will be any of crazy/outrageous/absurd/funny/insulting etc... The format must be EXACTLY <tweet-id>. <rating> for each tweet";

export const SYSTEM_MESSAGE_TOKENS = estimateTokens(SYSTEM_MESSAGE);

export const TWEETS_PER_REQUEST = 10;

export const ROUGH_OUTPUT_TOKENS = 20;

