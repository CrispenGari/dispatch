import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import { LogBox, View, Text, StatusBar } from "react-native";
import TRPCProvider from "./src/providers/TRPCProvider";
import { useFonts } from "expo-font";
import { trpc } from "./src/utils/trpc";
import Routes from "./src/routes/Routes";
import { Fonts } from "./src/constants";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs;
LogBox.ignoreAllLogs();

const App = () => {
  const [loaded] = useFonts(Fonts);
  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <StatusBar barStyle={"light-content"} />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <TRPCProvider>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle={"light-content"} />
        <Routes />
      </View>
    </TRPCProvider>
  );
};

registerRootComponent(App);
