export type Tweet = {
  id: number;
  text: string;
  isRetweet: 't' | 'f'; // Assuming "t" represents true and "f" represents false
  isDeleted: 't' | 'f';
  device: string;
  favorites: number;
  retweets: number;
  date: string; // If needed, you could parse this into a Date object when using it
  isFlagged: 't' | 'f';
};

export type RealTweet = {
  id: number;
  text: string;
  rating: number;
};

export type FakeTweet = {
  id: string;
  correspondingRealTweetId: number;
  text: string;
};
