import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import { APP_NAME } from "../constants";

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

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string
) => {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data: { testData: "test data" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
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
