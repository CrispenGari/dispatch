import { COLORS, FONTS } from "../../constants";
import { AppParamList } from "../../params";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { HomeStack } from "./home";
import { NotificationsStack } from "./notifications";
import { SettingsStack } from "./settings";
import TabIcon from "../../components/TabIcon/TabIcon";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useMeStore } from "../../store";
import React from "react";
import { Text } from "react-native";
const Tab = createMaterialTopTabNavigator<AppParamList>();

export const AppTabs = () => {
  const { me } = useMeStore();

  return (
    <Tab.Navigator
      initialRouteName="Feeds"
      screenOptions={{
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          borderColor: "transparent",
          backgroundColor: COLORS.white,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: "red",
      }}
    >
      <Tab.Screen
        options={{
          tabBarBadge() {
            return <Text>Hi</Text>;
          },
        }}
        name="Feeds"
        component={HomeStack}
      />
      <Tab.Screen name="Notifications" component={NotificationsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};
