import fs from 'fs';
import OpenAI from 'openai';
import highlyRatedTweets from './highly-rated-tweets.json' with { type: 'json' };
const openai = new OpenAI();

const REQUESTS_PER_MINUTE = 80;
const prompts = [];
for (const tweet of highlyRatedTweets) {
  const length = tweet.length;

  const uppercaseWords = tweet.match(/\b([A-Z]+)\b/g);
  const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
  const words = tweet.match(/\b([a-zA-Z]+)\b/g);
  const totalWords = words ? words.length : 0;
  const percentageOfUppercaseWords = Math.floor(
    (totalUppercaseWords / totalWords) * 100,
  );

  const numbers = tweet.match(/((\d+,)+\d+|\d+)/g);
  const totalNumbers = numbers ? numbers.length : 0;

  const totalHashtags = tweet.split('').filter((char) => char === '#').length;

  const systemMessage = `I'm making a game where users have to guess whether a donald trump tweet is real or fake. You will generate a fake donald trump tweet in his style of speaking (it must be from before 2021 February)${Math.random() < 0.5 ? " Make it funny but not so funny/absurd that it's obvious it's fake." : ''}`;
  const userMessage = `It should have roughly ${length} characters, ${percentageOfUppercaseWords}% of words should be in all capitals, have ${totalHashtags} hashtags, have ${totalNumbers} numbers. Think about the huge list of possible topics you could tweet about
  
  Step 1 - reiterate number of rough characters, percentage of words in all capitals, number of hashtags, number of numbers

  Step 2 - generate tweet according to criteria of previous step

  Output format -
  Step 1 - ...
  Step 2 - "<tweet>"`;
  prompts.push({ systemMessage, userMessage });
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
}

const generatedTweets = [];
async function generateTweet(systemMessage: string, userMessage: string) {
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

  const res = completion.choices[0].message as string;
  const newTweet = res.split('\n\n').at(-1);

  generatedTweets.push(newTweet);
}

const promises = [];
for (let i = 0; i < prompts.length; i += REQUESTS_PER_MINUTE) {
  promises.push(openai.chat.completions.create());
}
