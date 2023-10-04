import { Text, ScrollView } from "react-native";
import React from "react";
import type { AppParamList } from "../../params";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../constants";
import { trpc } from "../../utils/trpc";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
}
const Mentions: React.FunctionComponent<Props> = () => {
  const { data } = trpc.notification.notifications.useQuery({
    category: "mention",
  });
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text>{JSON.stringify({ data }, null, 2)}</Text>
    </ScrollView>
  );
};

export default Mentions;
