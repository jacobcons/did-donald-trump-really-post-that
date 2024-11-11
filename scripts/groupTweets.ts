import fs from 'fs';
import OpenAI from 'openai';
import highlyRatedTweets from './highly-rated-tweets.json' with { type: 'json' };

const tweetLengthBins = {
  '6-30': 0,
  '30-100': 0,
  '100-150': 0,
  '150-200': 0,
  '200-250': 0,
  '250-291': 0,
};

function placeTweetsIntoBins(binsKeys: string[], tweetStatFunction) {
  const bins = {};
  binsKeys.forEach((key) => (bins[key] = 0));

  const binMetaData = Object.keys(bins).map((range) => {
    const [min, max] = range.split('-');
    return { min: +min, max: +max };
  });

  for (const tweet of highlyRatedTweets) {
    const correctBinMetaData = binMetaData.find(
      (metaData) =>
        tweetStatFunction(tweet) >= metaData.min &&
        tweetStatFunction(tweet) < metaData.max,
    );
    if (correctBinMetaData !== undefined) {
      const { min, max } = correctBinMetaData;
      bins[`${min}-${max}`] = bins[`${min}-${max}`] + 1;
    }
  }
  return bins;
}

const lengthBins = placeTweetsIntoBins(
  ['6-30', '30-100', '100-150', '150-200', '200-250', '250-291'],
  (tweet) => tweet.length,
);

const capitalizationBins = placeTweetsIntoBins(
  ['0-1', '1-10', '10-50', '50-100', '100-101'],
  (tweet) => {
    const uppercaseWords = tweet.match(/\b([A-Z]+)\b/g);
    const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
    const words = tweet.match(/\b([a-zA-Z]+)\b/g);
    const totalWords = words ? words.length : 0;
    return Math.floor((totalUppercaseWords / totalWords) * 100);
  },
);

const TWEETS_TO_GENERATE = 50;
const tweetsToGenerateForBin = (binSize: number) =>
  Math.floor((binSize / highlyRatedTweets.length) * TWEETS_TO_GENERATE);

const lengthMessages = Object.entries(lengthBins).map(
  ([range, size]) =>
    `Generate exactly ${tweetsToGenerateForBin(size)} tweets that have between ${range} characters (inclusive-exclusive)`,
);

const capitalizationMessages = Object.entries(capitalizationBins)
  .map(
    ([range, size]) =>
      `Ensure that ${tweetsToGenerateForBin(size)} tweets have their the percentage of capitalized words being ${range}% (inclusive-exclusive)`,
  )
  .join('\n');

const finalMessage = `
I'm making a game where users have to guess if a donald trump tweet is real or fake. Generate tweets about a wide variety of topics. Ensure that there isn't a common feature with all the tweets that make them stand out as the fakes e.g. always having hashtags at the end. Make sure the tweets are in the style of donald trump's funny way of talking.

${lengthMessages[lengthMessages.length - 1]}
Count the number of characters in each tweet before you output it to ensure you have the correct number of characters in the range. MAKE SURE IT HAS THE CORRECT NUMBER IN CHARACTERS THAT FALLS WITHIN THE RANGE. Do not include this character count in the output.
Some of the tweets should have SOME capitalized words, and a few with ALL words capitalized
A few should have hashtags

Your output should be <n>. <tweet> where n starts at 1, nothing else.
`;

console.log(finalMessage);

console.log(highlyRatedTweets.filter((t) => t.length > 250).slice(0, 10));
