import fs from 'fs/promises';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function zip(...arrays) {
  const minLength = Math.min(...arrays.map((arr) => arr.length));
  return Array.from({ length: minLength }, (_, i) =>
    arrays.map((arr) => arr[i]),
  );
}

export async function readJson(path) {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function writeJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data));
}

export function getUpperCaseWordsMessage(text: string) {
  const uppercaseWords = text.match(/\b([A-Z]{2,})\b/g);
  const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
  const words = text.match(/\b([a-zA-Z]+)\b/g);
  const totalWords = words ? words.length : 0;
  const isAllUppercaseWords = totalUppercaseWords / totalWords === 1;
  return isAllUppercaseWords ? 'all' : totalUppercaseWords;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
  return array;
}
