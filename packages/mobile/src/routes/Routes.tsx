import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React from "react";
import { AuthStack } from "./auth";
import NetInfo from "@react-native-community/netinfo";
import {
  useLocationStore,
  useMeStore,
  useNetworkStore,
  useSettingsStore,
} from "../store";
import { AppTabs } from "./app";
import * as Location from "expo-location";
import { useLocationPermission, useNotificationsToken } from "../hooks";
import { trpc } from "../utils/trpc";
import { retrieve, sendPushNotification } from "../utils";
import { KEYS } from "../constants";
import type { SettingsType } from "../types";

const Routes = () => {
  const prefix = Linking.createURL("/");
  const { setNetwork } = useNetworkStore();
  const { setLocation } = useLocationStore();
  const { token } = useNotificationsToken();
  const { granted } = useLocationPermission();
  const { me, setMe } = useMeStore();
  const { setSettings } = useSettingsStore();

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
        if (!!token) {
          await sendPushNotification(
            token,
            `dispatch - ${data.user.nickname}`,
            data.message
          );
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
        if (!!token) {
          await sendPushNotification(
            token,
            `dispatch - ${data.user.nickname}`,
            data.message
          );
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
        if (!!token) {
          await sendPushNotification(
            token,
            `dispatch - ${data.user.nickname}`,
            data.message
          );
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
        if (!!token) {
          await sendPushNotification(
            token,
            `dispatch - ${data.user.nickname}`,
            data.message
          );
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
        if (!!token) {
          await sendPushNotification(
            token,
            `dispatch - ${data.user.nickname}`,
            data.message
          );
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
