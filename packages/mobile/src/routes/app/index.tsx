import { COLORS } from "../../constants";
import type { AppParamList } from "../../params";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import {
  ChangePassword,
  Create,
  Edit,
  Feed,
  Notifications,
  PrivacyPolicy,
  Settings,
  TermsOfUse,
  Tweet,
  ChangeEmail,
  User,
  Blocked,
} from "../../screens/app";
const Stack = createStackNavigator<AppParamList>();

export const AppTabs = () => {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          borderColor: "transparent",
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="AppTermsOfUse" component={TermsOfUse} />
      <Stack.Screen name="AppPrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="Create" component={Create} />
      <Stack.Screen name="Edit" component={Edit} />
      <Stack.Screen name="Tweet" component={Tweet} />
      <Stack.Screen name="User" component={User} />
      <Stack.Screen name="Blocked" component={Blocked} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
    </Stack.Navigator>
  );
};
