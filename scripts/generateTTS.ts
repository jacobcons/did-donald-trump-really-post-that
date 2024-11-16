import CryptoJS from 'crypto-js';
import axios from 'axios';
import fs from 'fs/promises';

// async function getCredentials() {
//   const res = await axios.get('https://tts-api.imyfone.com/v3/user/tourist_id');
//   const sessionId = res.data.data.session_id;
//   const touristId = res.data.data.tourist_id;
//   return { sessionId, touristId };
// }

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

// get url for generated audio
async function generateAudioUrl(text: string, token: string) {
  const res = await axios.postForm('https://tts-api.imyfone.com/v5/voice/tts', {
    accent: 'English(US)',
    emotion_name: 'Default',
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

async function downloadAudio(url: string) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const fileData = Buffer.from(res.data, 'binary');
  await fs.writeFile(`./tts/${Math.random()}.mp3`, res.data);
}

// main
const url = await generateAudioUrl(
  'b',
  'ed983fd8389b55241a0691df0a16f7ac1731766447',
);
await downloadAudio(url);
