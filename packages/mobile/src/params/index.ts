import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Auth Stack
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
  AuthPrivacyPolicy: undefined;
  AuthTermsOfUse: undefined;
};

export type AuthNavProps<T extends keyof AuthParamList> = {
  navigation: StackNavigationProp<AuthParamList, T>;
  route: RouteProp<AuthParamList, T>;
};

// App Stack
export type AppParamList = {
  Feed: undefined;
  Settings: undefined;
  Notifications: undefined;
  Create: undefined;
  Edit: { id: string; from: keyof AppParamList };
  Tweet: { id: string; from: keyof AppParamList };
  AppPrivacyPolicy: undefined;
  AppTermsOfUse: undefined;
  User: {
    id: string;
    from: keyof AppParamList;
  };
};

export type AppNavProps<T extends keyof AppParamList> = {
  navigation: StackNavigationProp<AppParamList, T>;
  route: RouteProp<AppParamList, T>;
};
