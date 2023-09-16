import { createStackNavigator } from "@react-navigation/stack";
import { NotificationsTabStacksParamList } from "../../../params";
import { COLORS, FONTS } from "../../../constants";
import { NotificationsLanding } from "../../../screens/app/notifications";

const Stack = createStackNavigator<NotificationsTabStacksParamList>();

export const NotificationsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="NotificationsLanding"
      screenOptions={{
        headerStyle: {
          shadowOpacity: 0,
          elevation: 0,
          borderBottomColor: "transparent",
          height: 100,
          backgroundColor: COLORS.secondary,
        },
        headerTitleStyle: {
          fontFamily: FONTS.regularBold,
          fontSize: 24,
        },
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="NotificationsLanding"
        component={NotificationsLanding}
      />
    </Stack.Navigator>
  );
};
