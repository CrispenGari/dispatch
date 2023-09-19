import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React from "react";
import { AuthStack } from "./auth";
import NetInfo from "@react-native-community/netinfo";
import { useLocationStore, useMeStore, useNetworkStore } from "../store";
import { AppTabs } from "./app";
import * as Location from "expo-location";
import { useLocationPermission } from "../hooks";

const Routes = () => {
  const prefix = Linking.createURL("/");
  const { setNetwork } = useNetworkStore();
  const { setLocation } = useLocationStore();
  const { granted } = useLocationPermission();
  const { me } = useMeStore();
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
      {me && me.isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
