import { NetInfoStateType } from "@react-native-community/netinfo";

export interface EditTweetFormType {
  text: string;
  height: number;
  enablePolls: boolean;
  polls: {
    id: number;
    text: string;
  }[];
  mentions: string[];
  pollExpiresIn: string;
}
export interface TweetFormType {
  text: string;
  height: number;
  enablePolls: boolean;
  polls: {
    id: number;
    text: string;
  }[];
  pollExpiresIn: string;
  mentions: string[];
}
export interface CommentFormType {
  height: number;
  text: string;
  liked: boolean;
  showResults: boolean;
  totalVotes: number;
  expired: boolean;
  viewCount: number;
  end: boolean;
  mentions: string[];
}
export interface ReplyFormType {
  height: number;
  text: string;
  liked: boolean;
  mentions: string[];
}
export type NetworkType = {
  type: NetInfoStateType | null;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

export type SettingsType = {
  haptics: boolean;
  sound: boolean;
  pageLimit: number;
  radius: number;
  notifications: {
    reaction: boolean;
    comment: boolean;
    reply: boolean;
    tweet: boolean;
    mention: boolean;
    vote: boolean;
  };
};

export interface TriggerType {
  notification:
    | {
        delete: boolean;
        read: boolean;
      }
    | undefined;
  tweet:
    | {
        comment: { id?: string };
        delete: { id?: string };
      }
    | undefined;
}
export type GenderType = "MALE" | "FEMALE" | "UNDEFINED";
