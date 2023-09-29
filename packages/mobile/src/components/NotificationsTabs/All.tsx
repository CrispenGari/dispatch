import { ScrollView, Text } from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { COLORS } from "../../constants";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
}
const All: React.FunctionComponent<Props> = () => {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text>All</Text>
    </ScrollView>
  );
};

export default All;
