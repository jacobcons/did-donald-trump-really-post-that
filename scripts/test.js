import nlp from 'compromise';

const tweet = 'Don Lemon is a fruad. No more Don!';
// Extract names and places
const doc = nlp(tweet);
const people = doc
  .people()
  .out('array')
  .sort((a, b) => b.length - a.length)[0];

console.log('People:', people);
