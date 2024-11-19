<script setup lang="ts">
import fakeTweets from './data/fake-tweets.json';
import realTweets from './data/real-tweets.json';
import { computed, onMounted, ref } from 'vue';

/* SCORE */
const totalAnswered = ref(0);
const totalCorrect = ref(0);
const scoreText = computed(() => {
  return totalAnswered.value === 0
    ? 'Play!'
    : `${totalCorrect.value}/${totalAnswered.value} (${Math.floor((totalCorrect.value / totalAnswered.value) * 100)}%)`;
});

/* TWEETS */
enum TweetType {
  Fake = 'fake',
  Real = 'real',
}
type Tweet = {
  id: string;
  text: string;
};

const randomTweet = ref<Tweet>();
let tweetType: TweetType;
let ttsAudio: HTMLAudioElement;
// get real and fake tweets that haven't yet been shown to user to ensure user sees new tweets
const UNSELECTED_REAL_TWEETS_KEY = 'unselectedRealTweetsV2';
const storedUnselectedRealTweets = localStorage.getItem(
  UNSELECTED_REAL_TWEETS_KEY,
);
let unselectedRealTweets = storedUnselectedRealTweets
  ? JSON.parse(storedUnselectedRealTweets)
  : [...realTweets];

const UNSELECTED_FAKE_TWEETS_KEY = 'unselectedFakeTweetsV2';
const storedUnselectedFakeTweets = localStorage.getItem(
  UNSELECTED_FAKE_TWEETS_KEY,
);
let unselectedFakeTweets = storedUnselectedFakeTweets
  ? JSON.parse(storedUnselectedFakeTweets)
  : [...fakeTweets];

onMounted(() => {
  selectNewTweet();
});

function selectNewTweet() {
  tweetType = Math.random() < 0.5 ? TweetType.Real : TweetType.Fake;
  randomTweet.value = pickRandom(
    tweetType === TweetType.Real ? TweetType.Real : TweetType.Fake,
  );
  ttsAudio = new Audio(`tts/${tweetType}/${randomTweet.value.id}.mp3`);
  ttsAudio.load();
}

function pickRandom(tweetType: TweetType): { id: string; text: string } {
  const array =
    tweetType === TweetType.Real ? unselectedRealTweets : unselectedFakeTweets;
  const index = Math.floor(Math.random() * array.length);
  const randomElement = array[index];

  array.splice(index, 1);

  if (!array.length) {
    array.push(...(tweetType === TweetType.Real ? realTweets : fakeTweets));
  }

  localStorage.setItem(
    tweetType === TweetType.Real
      ? UNSELECTED_REAL_TWEETS_KEY
      : UNSELECTED_FAKE_TWEETS_KEY,
    JSON.stringify(array),
  );

  return randomElement;
}

let correctAudio = new Audio('correct.mp3');
correctAudio.load();
let wrongAudio = new Audio('wrong.mp3');
wrongAudio.load();
let currentEvaluateAudio: HTMLAudioElement;
function makeGuess(guess: TweetType) {
  stopAudio(currentEvaluateAudio);
  stopAudio(ttsAudio);

  if (guess === tweetType) {
    totalCorrect.value += 1;
    currentEvaluateAudio = correctAudio;
  } else {
    currentEvaluateAudio = wrongAudio;
  }

  currentEvaluateAudio.load();
  currentEvaluateAudio.play();
  totalAnswered.value += 1;
  selectNewTweet();
}

function stopAudio(audio: HTMLAudioElement) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function playTTS() {
  stopAudio(ttsAudio);
  ttsAudio.play();
}
</script>

<template>
  <div class="mx-auto my-20 max-w-2xl px-4">
    <h1 class="text-center text-3xl font-extrabold text-slate-900">
      Did Donald Trump Really Tweet That?
    </h1>

    <div class="mt-20 flex items-center justify-between">
      <button
        type="button"
        class="me-2 inline-flex items-center gap-x-2 rounded-lg border border-gray-800 px-5 py-2.5 text-center text-base font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
        @click="makeGuess(TweetType.Real)"
      >
        <span>Real</span><span class="-translate-y-0.5 text-xl">👍</span>
      </button>

      <span class="text-center text-3xl font-bold text-slate-900">{{
        scoreText
      }}</span>

      <button
        type="button"
        class="me-2 inline-flex items-center gap-x-2 rounded-lg border border-gray-800 px-5 py-2.5 text-center text-base font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
        @click="makeGuess(TweetType.Fake)"
      >
        <span>Fake</span><span class="text-xl">👎</span>
      </button>
    </div>

    <div class="mt-20 flex gap-x-4">
      <div class="flex min-w-20 max-w-20 flex-col items-center gap-y-2">
        <img src="/profile_pic.jpg" alt="" class="rounded-full" />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-8 w-8 cursor-pointer"
          @click="playTTS"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          />
        </svg>
      </div>
      <div class="flex flex-col gap-y-2">
        <div class="flex items-center gap-x-0.5">
          <h2 class="text-xl font-bold text-slate-900">Donald Trump</h2>
          <svg
            viewBox="0 0 22 22"
            class="bg h-5 w-5 translate-y-0.5 fill-[rgb(29,155,240)]"
          >
            <g>
              <path
                d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
              ></path>
            </g>
          </svg>
        </div>

        <p class="text-lg" v-if="randomTweet" v-html="randomTweet.text"></p>
      </div>
    </div>
    <footer
      class="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-center text-sm"
    >
      Made By
      <a
        href="https://jacobcons.com"
        class="font-medium text-twitter hover:underline"
        target="_blank"
        >jacobcons.com</a
      >
    </footer>
  </div>
</template>
