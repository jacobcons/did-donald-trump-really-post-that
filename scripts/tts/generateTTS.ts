import CryptoJS from 'crypto-js';
import axios from 'axios';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { readJSON } from '../utils.js';
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
  const res = await axios.postForm(
    'https://tts-api.imyfone.com/v5/voice/tts',
    {
      isCancel: 'true',
      accent: 'English(US)',
      emotion_name: 'Default',
      text: `<speak>${cleanTextForTTS(text)}</speak>`,
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
    },
    {
      headers: {
        // Accept: 'application/json, text/plain, */*',
        // 'Accept-Encoding': 'gzip, deflate, br, zstd',
        // 'Accept-Language': 'en-GB,en;q=0.8',
        Authorization: token,
        // Connection: 'keep-alive',
        'Content-Length': String(text.length + 1713),
        // 'Content-Type':
        //   'multipart/form-data; boundary=----WebKitFormBoundaryAZRZoABHBB6ZmtCw',
        // Host: 'tts-api.imyfone.com',
        // Origin: 'https://www.topmediai.com',
        // Referer: 'https://www.topmediai.com/',
        token,
      },
    },
  );
  console.log(res.data.message);
  return decrypt(res.data.data.oss_url);
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

// MAIN
// const [real, fake]: [RealTweet[], FakeTweet[]] = await Promise.all([
//   readJSON('../real-tweets.json'),
//   readJSON('../fake-tweets.json'),
// ]);
//
// const token = await generateAuthToken();
//
// const url = await generateAudioUrl(
//   `THE OBSERVERS WERE NOT ALLOWED INTO THE COUNTING ROOMS. I WON THE ELECTION, GOT 71,000,000 LEGAL VOTES. BAD THINGS HAPPENED WHICH OUR OBSERVERS WERE NOT ALLOWED TO SEE. NEVER HAPPENED BEFORE. MILLIONS OF MAIL-IN BALLOTS WERE SENT TO PEOPLE WHO NEVER ASKED FOR THEM!`,
//   token,
// );

// WORK out which real and fake tweets the tts hasn't been generated for yet
// const realTweetIdsAlreadyGeneratedTTS = new Set();
// for (const file of await fs.readdir('./audio/real')) {
//   const id = file.split('.')[0];
//   realTweetIdsAlreadyGeneratedTTS.add(+id);
// }
// const realNotGeneratedTTS = real.filter(
//   (t) => !realTweetIdsAlreadyGeneratedTTS.has(t.id),
// );
//
// const fakeTweetIdsAlreadyGeneratedTTS = new Set();
// for (const file of await fs.readdir('./audio/fake')) {
//   const id = file.split('.')[0];
//   fakeTweetIdsAlreadyGeneratedTTS.add(id);
// }
// const fakeNotGeneratedTTS = fake.filter(
//   (t) => !fakeTweetIdsAlreadyGeneratedTTS.has(t.id),
// );
//
// let promises = [];
// const limit = pLimit(1);
// for (let i = 0; i < 1; i++) {
//   promises.push(
//     limit(() =>
//       generateAndDownloadAudio(
//         realNotGeneratedTTS[i].text,
//         `real/${realNotGeneratedTTS[i].id}`,
//       ),
//     ),
//     limit(() =>
//       generateAndDownloadAudio(
//         fakeNotGeneratedTTS[i].text,
//         `fake/${fakeNotGeneratedTTS[i].id}`,
//       ),
//     ),
//   );
// }

// await Promise.allSettled(promises);

console.timeEnd();
