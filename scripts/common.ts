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
