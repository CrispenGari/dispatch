import { ScrollView } from "react-native";
import React from "react";
import { trpc } from "../../utils/trpc";
import Tweet from "../Tweet/Tweet";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";

interface Props {
  uid: string;
  navigation: StackNavigationProp<AppParamList, "User">;
}
const TweetsTab: React.FunctionComponent<Props> = ({ uid, navigation }) => {
  const { data: tweets } = trpc.user.tweets.useQuery({ id: uid });
  if (!!!tweets) return null;
  return (
    <ScrollView
      style={{ marginTop: 10, flex: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {tweets.map((tweet) => (
        <Tweet
          tweet={tweet}
          key={tweet.id}
          navigation={navigation}
          from="User"
        />
      ))}
    </ScrollView>
  );
};

export default TweetsTab;
