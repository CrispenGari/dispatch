import { Text, ScrollView } from "react-native";
import React from "react";
import type { AppParamList } from "../../params";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../constants";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
}
const Mentions: React.FunctionComponent<Props> = () => {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text>Mentions</Text>
    </ScrollView>
  );
};

export default Mentions;
