import tweetsJson from "./tweets.json" with { type: "json" };
import OpenAI from "openai";
import clipboardy from "clipboardy";
import * as fs from "fs";
const openai = new OpenAI();
console.time();

type Tweet = {
  id: number;
  text: string;
  isRetweet: "t" | "f"; // Assuming "t" represents true and "f" represents false
  isDeleted: "t" | "f";
  device: string;
  favorites: number;
  retweets: number;
  date: string; // If needed, you could parse this into a Date object when using it
  isFlagged: "t" | "f";
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
      tweet.isRetweet === "f" &&
      !tweet.text.includes("https") &&
      !tweet.text.includes("@"),
  )
  .sort((a, b) => b.favorites - a.favorites)
  .map((tweet) => ({ id: tweet.id, text: tweet.text }));
//fs.writeFileSync('./filtered-tweets.json', JSON.stringify(filteredTweets))
const tweetsWithIndex = filteredTweets.map((tweet, i) => `${i}. ${tweet.text}`);

// PRICING ESTIMATES
const SYSTEM_MESSAGE =
  "I'm making a game where users have to guess if a donald trump tweet is real or fake. You are given tweets and must rate them based on how good a candidate they are from 1 to 10. Good candidates will be any of crazy/outrageous/absurd/funny/insulting etc... The format must be EXACTLY <tweet-id>. <rating> for each tweet";
const TWEETS_PER_REQUEST = 10;
const TOTAL_NUMBER_OF_REQUESTS = Math.ceil(
  tweetsWithIndex.length / TWEETS_PER_REQUEST,
);
function getPriceEstimates() {
  const userMessagesTokens = tweetsWithIndex.join("\n").length / 4;
  const systemMessageTokens = SYSTEM_MESSAGE.length / 4;
  const systemMessagesTokens = systemMessageTokens * TOTAL_NUMBER_OF_REQUESTS;
  const inputTokens = userMessagesTokens + systemMessagesTokens;
  const calculatePrice = (tokens: number, pricePerMillion: number) =>
    (tokens * (pricePerMillion / 1000000)).toFixed(2);
  const inputTokensPrice = calculatePrice(inputTokens, 2.5);
  const outputTokens = (6 * tweetsWithIndex.length) / 4;
  const outputTokensPrice = calculatePrice(outputTokens, 10);
  console.log(inputTokensPrice, outputTokensPrice);
}
getPriceEstimates();
let t = 0;
let tweetBins = [];
while (t < 20000) {}

// COMPLETITION
// const TOTAL_TWEETS = 200;
// const promises = [];
// for (let i = 0; i < TOTAL_TWEETS; i += TWEETS_PER_REQUEST) {
//   promises.push(
//     fetchAndWriteRatings(
//       tweetsWithIndex.slice(i, i + TWEETS_PER_REQUEST).join("\n"),
//     ),
//   );
// }
//
// await Promise.all(promises);
// fs.writeFileSync(
//   "./tweets-with-rating.json",
//   JSON.stringify(filteredTweets.slice(0, TOTAL_TWEETS), null, 2),
// );
//
// async function fetchAndWriteRatings(userMessage: string) {
//   if (!userMessage) {
//     return;
//   }
//
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//       { role: "system", content: SYSTEM_MESSAGE },
//       { role: "user", content: userMessage },
//     ],
//   });
//   const response = completion.choices[0].message.content as string;
//
//   for (const line of response.split("\n")) {
//     const [firstPart, secondPart] = line.split(". ");
//     const id = +firstPart;
//     const rating = +secondPart;
//     filteredTweets[id].rating = rating;
//   }
// }

console.timeEnd();
