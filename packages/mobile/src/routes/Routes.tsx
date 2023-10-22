import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React from "react";
import { AuthStack } from "./auth";
import NetInfo from "@react-native-community/netinfo";
import {
  useLocationStore,
  useMeStore,
  useNetworkStore,
  useNotificationCountStore,
  useSettingsStore,
} from "../store";
import { AppTabs } from "./app";
import * as Location from "expo-location";
import { useLocationPermission, useNotificationsToken } from "../hooks";
import { trpc } from "../utils/trpc";
import { retrieve, schedulePushNotification } from "../utils";
import { KEYS } from "../constants";
import type { SettingsType } from "../types";

const Routes = () => {
  const prefix = Linking.createURL("/");
  const { setNetwork } = useNetworkStore();
  const { setLocation } = useLocationStore();
  const { token } = useNotificationsToken();
  const { granted } = useLocationPermission();
  const { me, setMe } = useMeStore();
  const { setSettings, settings } = useSettingsStore();
  const { count: badge } = useNotificationCountStore();

  trpc.user.onUpdate.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        setMe(data);
      },
    }
  );

  trpc.reaction.onNewReactionNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data) => {
        if (!!token && settings.notifications.reaction) {
          await schedulePushNotification({
            title: `dispatch - ${data.type}`,
            body: data.message,
            data: { from: "Feed", tweetId: data.tweetId },
            badge: badge === 0 ? undefined : badge,
          });
        }
      },
    }
  );
  trpc.comment.onNewCommentNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data) => {
        if (!!token && settings.notifications.comment) {
          await schedulePushNotification({
            title: `dispatch - ${data.type}`,
            body: data.message,
            data: { from: "Feed", tweetId: data.tweetId },
            badge: badge === 0 ? undefined : badge,
          });
        }
      },
    }
  );
  trpc.tweet.onNewTweetNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!token && settings.notifications.tweet) {
          await schedulePushNotification({
            title: `dispatch - ${data.type}`,
            body: data.message,
            data: { from: "Feed", tweetId: data.tweetId },
            badge: badge === 0 ? undefined : badge,
          });
        }
      },
    }
  );
  trpc.tweet.onTweetMention.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!token && settings.notifications.mention) {
          await schedulePushNotification({
            title: `dispatch - ${data.type}`,
            body: data.message,
            data: { from: "Feed", tweetId: data.tweetId },
            badge: badge === 0 ? undefined : badge,
          });
        }
      },
    }
  );
  trpc.poll.onVoteNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!token && settings.notifications.vote) {
          await schedulePushNotification({
            title: `dispatch - ${data.type}`,
            body: data.message,
            data: { from: "Feed", tweetId: data.tweetId },
            badge: badge === 0 ? undefined : badge,
          });
        }
      },
    }
  );

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      ({ type, isInternetReachable, isConnected }) => {
        setNetwork({ type, isConnected, isInternetReachable });
      }
    );
    return () => unsubscribe();
  }, [setNetwork]);

  React.useEffect(() => {
    if (granted) {
      Location.getCurrentPositionAsync().then((value) => {
        setLocation(value);
      });
    }
  }, [granted, setLocation]);

  React.useEffect(() => {
    (async () => {
      const v = await retrieve(KEYS.APP_SETTINGS);
      if (!!v) {
        const s = JSON.parse(v) as SettingsType;
        setSettings(s);
      }
    })();
  }, []);

  return (
    <NavigationContainer
      linking={{
        prefixes: [
          prefix,
          "dispatch://",
          "https://dispatch.com",
          "https://*.dispatch.com",
        ],
        config: {
          screens: {
            Profile: "profile",
            ResetPassword: "resetPassword",
          },
        },
      }}
    >
      {me && me.isAuthenticated && me.confirmed ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
