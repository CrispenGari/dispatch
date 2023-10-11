import { View, useWindowDimensions, Text } from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { COLORS, FONTS, notificationsSorts } from "../../../constants";
import { styles } from "../../../styles";
import { onImpact } from "../../../utils";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";
import { useNetworkStore, useSettingsStore } from "../../../store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import Mentions from "../../../components/NotificationsTabs/Mentions";
import All from "../../../components/NotificationsTabs/All";
import NotificationBadge from "../../../components/NotificationBadge/NotificationBadge";
import NotificationSort from "../../../components/BottomSheets/NotificationSort";

const Notifications: React.FunctionComponent<AppNavProps<"Notifications">> = ({
  navigation,
}) => {
  const layout = useWindowDimensions();
  const [sort, setSort] = React.useState(notificationsSorts[0]);
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((state) => !state);
  const { os } = usePlatform();
  const { settings } = useSettingsStore();
  const [index, setIndex] = React.useState(0);

  const { network } = useNetworkStore();
  const [routes] = React.useState([
    { key: "all", title: "ALL" },
    { key: "mentions", title: "Mentions" },
  ]);
  const [state, setState] = React.useState({
    status: "offline" as "online" | "connected" | "offline",
  });
  React.useEffect(() => {
    if (network.isConnected && network.isInternetReachable) {
      setState((state) => ({ ...state, status: "online" }));
    } else if (network.isConnected && !network.isInternetReachable) {
      setState((state) => ({ ...state, status: "connected" }));
    } else {
      setState((state) => ({ ...state, status: "offline" }));
    }
  }, [network]);

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
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, settings]);
  return (
    <View style={{ flex: 1 }}>
      <NotificationSort
        sort={sort}
        setSort={setSort}
        open={open}
        toggle={toggle}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 10,
          justifyContent: "space-between",
          backgroundColor: COLORS.main,
          paddingTop: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            position: "absolute",
            top: 10,
            alignItems: "center",
          }}
        >
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: 20,
              shadowRadius: 2,
              shadowOffset: { width: 2, height: 2 },
              shadowColor: COLORS.white,
              borderWidth: 0.5,
              borderRadius: 999,
              shadowOpacity: 1,
              elevation: 1,
              backgroundColor: COLORS.main,
              borderColor: COLORS.primary,
            }}
          >
            <Text
              style={[
                styles.h1,
                {
                  color:
                    state.status === "online"
                      ? COLORS.primary
                      : state.status === "offline"
                      ? COLORS.red
                      : COLORS.black,
                },
              ]}
            >
              {state.status}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: FONTS.regularBold, fontSize: 25, flex: 1 }}>
          {sort.name}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            width: 50,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 2,
            borderRadius: 50,
          }}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            toggle();
          }}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
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
          all: () => <All sort={sort} navigation={navigation} />,
          mentions: () => <Mentions sort={sort} navigation={navigation} />,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: COLORS.primary, height: 5 }}
            style={{ backgroundColor: COLORS.main }}
            tabStyle={{ paddingVertical: 0 }}
            labelStyle={[
              styles.h1,
              { color: COLORS.black, fontSize: 16, textTransform: "lowercase" },
            ]}
            renderBadge={({ route }) => <NotificationBadge route={route} />}
          />
        )}
        tabBarPosition="top"
      />
    </View>
  );
};

export default Notifications;
