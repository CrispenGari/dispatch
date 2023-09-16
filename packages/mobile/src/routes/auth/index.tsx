import { createStackNavigator } from "@react-navigation/stack";

import {
  Landing,
  Login,
  Register,
  Profile,
  ForgotPassword,
  ResetPassword,
} from "../../screens/auth";
import { AuthParamList } from "../../params";

const Stack = createStackNavigator<AuthParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
};