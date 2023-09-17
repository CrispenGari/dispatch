import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import { LogBox, View, StatusBar } from "react-native";
import TRPCProvider from "./src/providers/TRPCProvider";
import { useFonts } from "expo-font";
import Routes from "./src/routes/Routes";
import { Fonts } from "./src/constants";
import * as Notifications from "expo-notifications";
import Loading from "./src/components/Loading/Loading";
import { usePlatform } from "./src/hooks";

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
  const { os } = usePlatform();
  const [loaded] = useFonts(Fonts);
  if (!loaded) return <Loading />;
  return (
    <TRPCProvider>
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle={os === "android" ? "light-content" : "dark-content"}
        />
        <Routes />
      </View>
    </TRPCProvider>
  );
};

registerRootComponent(App);
