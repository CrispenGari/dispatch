import { View, useWindowDimensions } from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { COLORS, FONTS } from "../../../constants";
import { styles } from "../../../styles";
import { onImpact } from "../../../utils";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";
import { useSettingsStore } from "../../../store";
import All from "../../../components/NotificationsTabs/All";
import Mentions from "../../../components/NotificationsTabs/Mentions";

const Notifications: React.FunctionComponent<AppNavProps<"Notifications">> = ({
  navigation,
}) => {
  const layout = useWindowDimensions();
  const { os } = usePlatform();
  const { settings } = useSettingsStore();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "all", title: "ALL" },
    { key: "mentions", title: "Mentions" },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Notifications",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? "Feed" : ""}
          onPress={() => {
            () => {
              if (settings.haptics) {
                onImpact();
              }
              navigation.replace("Feed");
            };
          }}
        />
      ),
    });
  }, [navigation, settings]);

  return (
    <View style={{ flex: 1 }}>
      <TabView
        style={{
          backgroundColor: COLORS.main,
          borderBottomWidth: 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: 0,
          shadowOpacity: 0,
          borderBlockColor: "transparent",
        }}
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          all: () => <All navigation={navigation} />,
          mentions: () => <Mentions navigation={navigation} />,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: COLORS.primary, height: 5 }}
            style={{ backgroundColor: COLORS.main }}
            tabStyle={{ paddingVertical: 15 }}
            labelStyle={[
              styles.h1,
              { color: COLORS.black, fontSize: 16, textTransform: "lowercase" },
            ]}
          />
        )}
        tabBarPosition="top"
      />
    </View>
  );
};

export default Notifications;
