import { ScrollView, Text } from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";

interface Props {
  uid: string;
  navigation: StackNavigationProp<AppParamList, "User">;
}
const MentionsTab: React.FunctionComponent<Props> = ({}) => {
  return (
    <ScrollView
      style={{ marginTop: 10, flex: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text>MentionsTab</Text>
    </ScrollView>
  );
};

export default MentionsTab;
