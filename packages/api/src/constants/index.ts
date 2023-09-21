export const __verify__prefix__ = "verify:";
export const __reset__password__prefix__ = "reset__password:";

export const __code__exp__ = 60 * 60; // 1hr
export const __token__exp__ = 60 * 60; // 1hr
export enum Events {
  ON_HI = "ON_HI",

  // POLLS

  // TWEET
  ON_NEW_TWEET = "ON_NEW_TWEET",
  ON_TWEET_REACTION = "ON_TWEET_REACTION",
  ON_TWEET_COMMENT = "ON_TWEET_COMMENT",
  ON_TWEET_VIEW = "ON_TWEET_VIEW",
  ON_TWEET_UPDATE = "ON_TWEET_UPDATE",
  ON_TWEET_DELETE = "ON_TWEET_DELETE",

  // COMMENTS

  ON_COMMENT_REPLY = "ON_COMMENT_REPLY",
  ON_COMMENT_REACTION = "ON_COMMENT_REACTION",
}
