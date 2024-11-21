import {readJSON, writeJSON} from "./utils.js";
import {FakeTweet, RealTweet} from "./types.js";
import Prompt from 'prompt-sync'
const prompt = Prompt()


async function promptRealTweets() {
  let realTweets = []
  try {
    realTweets = await readJSON('real-tweets.json') as RealTweet[]
  } catch (e) {
  }
  const realTweetsAll = await readJSON('all-real-tweets.json') as RealTweet[]

  const startingIndex = realTweetsAll.findIndex(t => t.id === realTweets.at(-1)?.id) + 1
  let i = startingIndex
  const selectedTweets = []
  while (i < realTweetsAll.length) {
    const currentTweet = realTweetsAll[i]
    console.log(i)
    console.log(currentTweet)
    const option = prompt('(y/d/other): ')
    console.log('\n')
    if (option === 'y') {
      selectedTweets.push(currentTweet)
    } else if (option === 'd') {
      await writeJSON('./real-tweets.json', realTweets.concat(selectedTweets))
      break
    }
    i++
  }
  await writeJSON('./real-tweets.json', realTweets.concat(selectedTweets))
}

async function matchFakeTweetsWithRealTweets() {
  const realTweets = await readJSON('real-tweets.json') as RealTweet[]
  const allFakeTweets = await readJSON('all-fake-tweets.json') as FakeTweet[]
  const fakeTweets = []
  for (const {id} of realTweets) {
    const correspondingFakeTweet = allFakeTweets.find(t => t.correspondingRealTweetId === id)
    fakeTweets.push(correspondingFakeTweet)
  }
  await writeJSON('fake-tweets.json', fakeTweets)
}

await matchFakeTweetsWithRealTweets()
