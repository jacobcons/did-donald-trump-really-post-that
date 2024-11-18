import CryptoJS from 'crypto-js';
import axios from 'axios';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { delay, readJSON, upperCaseWordsStats } from '../utils.js';
import { FakeTweet, RealTweet } from '../types.js';
import * as path from 'path';
import pLimit from 'p-limit';
import { ToWords } from 'to-words';
const toWords = new ToWords({
  localeCode: 'en-US',
});

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
  const { totalWords, totalUpperCaseWords } = upperCaseWordsStats(text);
  const isEmotional = totalUpperCaseWords / totalWords > 0.2;
  const stability = isEmotional ? 0 : 50;
  const exaggeration = isEmotional ? 100 : 0;

  const res = await fetch('http://tts-api.imyfone.com/v5/voice/tts', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en;q=0.8',
      authorization: token,
      'content-type':
        'multipart/form-data; boundary=----WebKitFormBoundarytsZtPzSdVvG1YTCs',
      device: 'd55655bf0a15f80579597239e8bf3a60',
      'sec-ch-ua': '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'sec-gpc': '1',
      token: token,
      touristcode: 'Guest_5197s10gv4MB8',
      'web-req': '1',
      'x-requested-with': 'TTS',
      Referer: 'https://www.topmediai.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: `------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"isCancel\"\r\n\r\ntrue\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"accent\"\r\n\r\nEnglish(US)\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"emotion_name\"\r\n\r\nDefault\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\n<speak>${cleanTextForTTS(text)}</speak>\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"speed\"\r\n\r\n1\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"volume\"\r\n\r\n50\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"voice_id\"\r\n\r\n7f954f14-55fa-11ef-a7a0-00163e0e200f\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"article_title\"\r\n\r\nUnnamed\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"is_audition\"\r\n\r\n1\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"pitch\"\r\n\r\n3\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"stability\"\r\n\r\n${stability}\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"similarity\"\r\n\r\n95\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"exaggeration\"\r\n\r\n${exaggeration}\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"eliminate_noise\"\r\n\r\n0\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"country_code\"\r\n\r\nGB\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundarytsZtPzSdVvG1YTCs--\r\n`,
    method: 'POST',
    // dispatcher: proxies[Math.floor(Math.random() * proxies.length)],
  });

  const json = await res.json();
  return decrypt(json.data.oss_url);
}

function cleanTextForTTS(text: string) {
  // convert hashtag symbols to the word hashtag
  // convert numbers to words
  return text
    .replaceAll('#', 'hashtag ')
    .replaceAll(/-?(?:\d{1,3}(?:,\d{3})+)|\d+(?:\.\d+)?/g, (match) => {
      return toWords.convert(+match.replaceAll(',', ''));
    });
}

async function downloadAudio(url: string, path: string) {
  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(`./audio/${path}.mp3`, buffer);
}

async function generateAuthToken() {
  let res = await fetch(
    `http://account-api.topmediai.com/account/register?email=${uuidv4()}%40gmail.com&password=72d2ecce648b4a8aa8a280c62507ebc1&information_sources=https:%2F%2Faccount.topmediai.com&source_site=www.topmediai.com&software_code=d55655bf0a15f80579597239e8bf3a60`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en;q=0.8',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'x-requested-with': 'TTS',
        Referer: 'https://www.topmediai.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: null,
      method: 'GET',
      // dispatcher: proxies[Math.floor(Math.random() * proxies.length)],
    },
  );

  let json = await res.json();
  return json.data.token;
}

async function generateAndDownloadAudio(text: string, path: string) {
  const token = await generateAuthToken();

  const url = await generateAudioUrl(text, token);

  await downloadAudio(url, path);
}

// MAIN
const [real, fake]: [RealTweet[], FakeTweet[]] = await Promise.all([
  readJSON('../real-tweets.json'),
  readJSON('../fake-tweets.json'),
]);

// WORK out which real and fake tweets the tts hasn't been generated for yet
const realTweetIdsAlreadyGeneratedTTS = new Set();
for (const file of await fs.readdir('./audio/real')) {
  const id = file.split('.')[0];
  realTweetIdsAlreadyGeneratedTTS.add(+id);
}
const realNotGeneratedTTS = real.filter(
  (t) => !realTweetIdsAlreadyGeneratedTTS.has(t.id),
);

const fakeTweetIdsAlreadyGeneratedTTS = new Set();
for (const file of await fs.readdir('./audio/fake')) {
  const id = file.split('.')[0];
  fakeTweetIdsAlreadyGeneratedTTS.add(id);
}
const fakeNotGeneratedTTS = fake.filter(
  (t) => !fakeTweetIdsAlreadyGeneratedTTS.has(t.id),
);

const limit = pLimit(Infinity);
const BATCH_SIZE = 5;
let j = 0;
for (
  let i = 0;
  i < Math.max(realNotGeneratedTTS.length, fakeNotGeneratedTTS.length);
  i += BATCH_SIZE
) {
  console.log(`starting batch ${j}`);
  let promises = [];

  promises.push(
    ...realNotGeneratedTTS
      .slice(i, i + BATCH_SIZE)
      .map((tweet) =>
        limit(() => generateAndDownloadAudio(tweet.text, `real/${tweet.id}`)),
      ),
  );
  promises.push(
    ...fakeNotGeneratedTTS
      .slice(i, i + BATCH_SIZE)
      .map((tweet) =>
        limit(() => generateAndDownloadAudio(tweet.text, `fake/${tweet.id}`)),
      ),
  );

  const results = await Promise.allSettled(promises);
  console.log(`finished batch ${j}:`);
  console.log(results.filter((result) => result.status === 'fulfilled').length);
  console.log(results.filter((result) => result.status === 'rejected').length);
  console.log('\n');
  j++;
  await delay(91 * 1000);
}

console.timeEnd();
