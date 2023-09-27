import { View, Text } from "react-native";
import React from "react";
import { trpc } from "../../utils/trpc";
import Tweet from "../Tweet/Tweet";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppParamList } from "../../params";

interface Props {
  uid: string;
  navigation: StackNavigationProp<AppParamList, "User">;
}
const TweetsTab: React.FunctionComponent<Props> = ({ uid, navigation }) => {
  const { data: tweets, isLoading } = trpc.user.tweets.useQuery({ id: uid });
  if (!!!tweets) return null;
  return (
    <View style={{ marginTop: 10 }}>
      {tweets.map((tweet) => (
        <Tweet
          tweet={tweet}
          key={tweet.id}
          navigation={navigation}
          from="User"
        />
      ))}
    </View>
  );
};

export default TweetsTab;
