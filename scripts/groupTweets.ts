import fs from 'fs';
import OpenAI from 'openai';
import clustering from 'density-clustering';
import clipboardy from 'clipboardy';
const kmeans = new clustering.KMEANS();
const openai = new OpenAI();

const tweets = JSON.parse(
  fs.readFileSync('./highly-rated-tweets.json', 'utf-8'),
);
console.log(tweets.slice(30, 40));
