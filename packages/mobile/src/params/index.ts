import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialTopTabNavigationProp } from "@react-navigation/material-top-tabs";

export type AuthParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Profile: {
    code: string;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
  };
};

export type AuthNavProps<T extends keyof AuthParamList> = {
  navigation: StackNavigationProp<AuthParamList, T>;
  route: RouteProp<AuthParamList, T>;
};

// Tabs
export type AppParamList = {
  Feeds: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type AppNavProps<T extends keyof AppParamList> = {
  navigation: MaterialTopTabNavigationProp<AppParamList, T>;
  route: RouteProp<AppParamList, T>;
};

// Home Tab Stacks

export type HomeTabStacksParamList = {
  Posts: undefined;
  Create: undefined;
};

export type HomeTabStacksNavProps<T extends keyof HomeTabStacksParamList> = {
  navigation: StackNavigationProp<HomeTabStacksParamList, T>;
  route: RouteProp<HomeTabStacksParamList, T>;
};

// Settings TabStacks

export type SettingsTabStacksParamList = {
  SettingsLanding: undefined;
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;
};

export type SettingsTabStacksNavProps<
  T extends keyof SettingsTabStacksParamList
> = {
  navigation: StackNavigationProp<SettingsTabStacksParamList, T>;
  route: RouteProp<SettingsTabStacksParamList, T>;
};

// Notifications TabStacks

export type NotificationsTabStacksParamList = {
  NotificationsLanding: undefined;
};

export type NotificationsTabStacksNavProps<
  T extends keyof NotificationsTabStacksParamList
> = {
  navigation: StackNavigationProp<NotificationsTabStacksParamList, T>;
  route: RouteProp<NotificationsTabStacksParamList, T>;
};
