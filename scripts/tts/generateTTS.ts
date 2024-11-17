import CryptoJS from 'crypto-js';
import axios from 'axios';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { readJSON } from '../utils.js';
import { FakeTweet, RealTweet } from '../types.js';
import * as path from 'path';

console.time();
// decrypt object storage url
const key = CryptoJS.enc.Utf8.parse('123456789imyfone123456789imyfone');
const iv = CryptoJS.enc.Utf8.parse('123456789imyfone');
function decrypt(str: string) {
  return CryptoJS.AES.decrypt(str, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
}

// get url for generated tts
async function generateAudioUrl(text: string, token: string) {
  const res = await axios.postForm('https://tts-api.imyfone.com/v5/voice/tts', {
    accent: 'English(US)',
    emotion_name: 'Angry',
    text: `<speak>${text}</speak>`,
    speed: 1,
    volume: 50,
    voice_id: '7f954f14-55fa-11ef-a7a0-00163e0e200f',
    article_title: 'Unnamed',
    is_audition: 1,
    pitch: 3,
    stability: 50,
    similarity: 95,
    exaggeration: 0,
    eliminate_noise: 0,
    country_code: 'GB',
    token,
  });
  return decrypt(res.data.data.oss_url);
}

async function downloadAudio(url: string, path: string) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const fileData = Buffer.from(res.data, 'binary');
  await fs.writeFile(`./audio/${path}.mp3`, res.data);
}

async function generateAuthToken() {
  const res = await axios.get(
    `https://account-api.topmediai.com/account/register?email=${uuidv4()}%40gmail.com&password=e10adc3949ba59abbe56e057f20f883e&information_sources=https%3A%2F%2Fwww.topmediai.com&source_site=www.topmediai.com&software_code=8da81baf4bd6bc2a23cb130c883bda3a&lang=en`,
  );
  return res.data.data.token;
}

async function generateAndDownloadAudio(text: string, path: string) {
  const token = await generateAuthToken();

  const url = await generateAudioUrl(text, token);

  await downloadAudio(url, path);
}

// main
const [real, fake]: [RealTweet[], FakeTweet[]] = await Promise.all([
  readJSON('../real-tweets.json'),
  readJSON('../fake-tweets.json'),
]);

let promises = [];
for (let i = 0; i < 1; i++) {
  promises.push(
    generateAndDownloadAudio(real[i].text, `real/${real[i].id}`),
    generateAndDownloadAudio(fake[i].text, `fake/${fake[i].id}`),
  );
}

await Promise.allSettled(promises);
console.log('finished');

console.timeEnd();
