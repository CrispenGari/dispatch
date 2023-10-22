import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import { APP_NAME, COLORS } from "../constants";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import type { AppParamList } from "../params";

let tweetedSound: Audio.Sound | undefined;
let reactedSound: Audio.Sound | undefined;

export const playTweeted = async () => {
  const { sound: s, status } = await Audio.Sound.createAsync(
    require("../../assets/sounds/tweeted.wav"),
    {
      shouldPlay: true,
      isLooping: false,
      isMuted: false,
    }
  );
  if (status.isLoaded) {
    tweetedSound = s;
  }
  if (!!tweetedSound) {
    await tweetedSound.playAsync().catch((err) => console.log(err));
  }
};
export const playReacted = async () => {
  const { sound: s, status } = await Audio.Sound.createAsync(
    require("../../assets/sounds/reaction.mp3"),
    {
      shouldPlay: true,
      isLooping: false,
      isMuted: false,
    }
  );
  if (status.isLoaded) {
    reactedSound = s;
  }
  if (!!reactedSound) {
    await reactedSound.playAsync().catch((err) => console.log(err));
  }
};

export const rateApp = async () => {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    const hasAction = await StoreReview.hasAction();
    if (hasAction) {
      await StoreReview.requestReview();
    }
  }
};

export const onImpact = () => Haptics.impactAsync();
export const onNotification = () => Haptics.notificationAsync();

export const onFetchUpdateAsync = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    Alert.alert(
      APP_NAME,
      error as any,
      [{ text: "OK", style: "destructive" }],
      { cancelable: false }
    );
  }
};

export const schedulePushNotification = async ({
  title,
  body,
  data,
  badge,
  subtitle,
}: {
  title: string;
  body: string;
  data: {
    tweetId: string;
    from: keyof AppParamList;
  };
  badge?: number;
  subtitle?: string;
}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      badge,
      color: COLORS.primary,
      sound: "notification.wav",
      subtitle,
    },
    trigger: { seconds: 2 },
  });
};

export const store = async (key: string, value: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    console.log(error);
    return true;
  }
};

export const retrieve = async (key: string): Promise<string | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export const del = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error: any) {
    return false;
  }
};
