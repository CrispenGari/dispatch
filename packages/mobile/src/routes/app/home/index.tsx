import { createStackNavigator } from "@react-navigation/stack";
import { HomeTabStacksParamList } from "../../../params";
import { COLORS, FONTS } from "../../../constants";
import { Posts, Create } from "../../../screens/app/home";

const Stack = createStackNavigator<HomeTabStacksParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Posts"
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
      <Stack.Screen name="Posts" component={Posts} />
      <Stack.Screen name="Create" component={Create} />
    </Stack.Navigator>
  );
};
