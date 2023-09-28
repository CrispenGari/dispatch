import { View, Text } from "react-native";
import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppParamList } from "../../params";

interface Props {
  uid: string;

  navigation: StackNavigationProp<AppParamList, "User">;
}
const MentionsTab: React.FunctionComponent<Props> = ({}) => {
  return (
    <View>
      <Text>MentionsTab</Text>
    </View>
  );
};

export default MentionsTab;
