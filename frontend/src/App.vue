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
  Fake,
  Real,
}

const randomTweet = ref('');
const tweetType = ref();

const UNSELECTED_REAL_TWEETS_KEY = 'unselectedRealTweetsV1';
const storedUnselectedRealTweets = localStorage.getItem(
  UNSELECTED_REAL_TWEETS_KEY,
);
let unselectedRealTweets = storedUnselectedRealTweets
  ? JSON.parse(storedUnselectedRealTweets)
  : [...realTweets];

const UNSELECTED_FAKE_TWEETS_KEY = 'unselectedFakeTweetsV1';
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
  tweetType.value = Math.random() < 0.5 ? TweetType.Real : TweetType.Fake;
  randomTweet.value = pickRandom(
    tweetType.value === TweetType.Real ? TweetType.Real : TweetType.Fake,
  );
}

let correctSound = new Audio('correct.mp3');
correctSound.volume = 0.1;

let wrongSound = new Audio('wrong.mp3');
wrongSound.volume = 0.1;

let currentSound: HTMLAudioElement;
function makeGuess(guess: TweetType) {
  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
  }

  if (guess === tweetType.value) {
    totalCorrect.value += 1;
    currentSound = correctSound;
  } else {
    currentSound = wrongSound;
  }

  currentSound.play();
  totalAnswered.value += 1;
  selectNewTweet();
}

function pickRandom(tweetType: TweetType): string {
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
      <img src="/profile_pic.jpg" alt="" class="h-20 w-20 rounded-full" />
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

        <p class="text-lg" v-html="randomTweet"></p>
      </div>
    </div>
    <footer
      class="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-center text-sm"
    >
      Made By
      <a
        href="https://jacobcons.com"
        class="text-twitter hover:underline"
        target="_blank"
        >jacobcons.com</a
      >
    </footer>
  </div>
</template>
