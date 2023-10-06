export const __verify__prefix__ = "verify:";
export const __reset__password__prefix__ = "reset__password:";

export const __code__exp__ = 60 * 60; // 1hr
export const __token__exp__ = 60 * 60; // 1hr

export enum Events {
  // BLOCKED
  ON_USER_UN_BLOCK = "ON_USER_UN_BLOCK",
  ON_USER_BLOCK = "ON_USER_BLOCK",
  // MENTIONS
  ON_TWEET_MENTION = "ON_TWEET_MENTION",
  // AUTH
  ON_AUTH_STATE_CHANGED = "ON_AUTH_STATE_CHANGED",
  ON_HI = "ON_HI",

  // POLLS
  ON_POLL_VOTE = "ON_POLL_VOTE",

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
  ON_COMMENT_DELETE = "ON_COMMENT_DELETE",

  // REPLY
  ON_COMMENT_REPLY_REACTION = "ON_COMMENT_REPLY_REACTION",
  ON_COMMENT_REPLY_DELETE = "ON_COMMENT_REPLY_DELETE",

  // NOTIFICATION
  ON_NEW_NOTIFICATION = "ON_NEW_NOTIFICATION",
  ON_NOTIFICATION_DELETE = "ON_NOTIFICATION_DELETE",
  ON_NOTIFICATION_READ = "ON_NOTIFICATION_READ",

  // USER
  ON_PROFILE_VIEW = "ON_PROFILE_VIEW",
  ON_USER_UPDATE = "ON_USER_UPDATE",
  ON_USER_EMAIL_CHANGED = "ON_USER_EMAIL_CHANGED",
}
