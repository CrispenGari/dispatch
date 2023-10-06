import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  View,
  Text,
} from "react-native";
import React from "react";
import { trpc } from "../../utils/trpc";
import Tweet from "../Tweet/Tweet";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { useSettingsStore } from "../../store";
import { COLORS } from "../../constants";
import Ripple from "../ProgressIndicators/Ripple";
import { styles } from "../../styles";
import TweetSkeleton from "../skeletons/TweetSkeleton";

interface Props {
  uid: string;
  navigation: StackNavigationProp<AppParamList, "User">;
}
const TweetsTab: React.FunctionComponent<Props> = ({ uid, navigation }) => {
  const { settings } = useSettingsStore();
  const {
    data,
    refetch,
    isFetching: fetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.user.tweets.useInfiniteQuery(
    {
      limit: settings.pageLimit,
      orderBy: "asc",
      id: uid,
    },
    {
      keepPreviousData: true,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  );
  const [tweets, setTweets] = React.useState<
    {
      id: string;
    }[]
  >([]);
  trpc.tweet.onNewTweet.useSubscription(
    { uid },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.tweet.onDeleteTweet.useSubscription(
    { uid },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  const [end, setEnd] = React.useState(false);
  const onScroll = async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    const paddingToBottom = 10;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const close =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setEnd(close);
    if (close && hasNextPage) {
      await fetchNextPage();
    }
  };
  React.useEffect(() => {
    if (!!data?.pages) {
      setTweets(data.pages.flatMap((page) => page.tweets));
    }
  }, [data]);

  if (fetching && tweets.length === 0)
    return (
      <ScrollView>
        {Array(10).map((_, i) => (
          <TweetSkeleton key={i} />
        ))}
      </ScrollView>
    );
  if (tweets.length === 0)
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={[styles.p, { fontSize: 14 }]}>No tweets.</Text>
      </View>
    );
  return (
    <ScrollView
      style={{ marginTop: 10, flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          shouldRasterizeIOS={true}
          refreshing={fetching}
          onRefresh={async () => {
            await refetch();
          }}
        />
      }
    >
      {tweets.map((tweet) => (
        <Tweet
          tweet={tweet}
          key={tweet.id}
          navigation={navigation}
          from="User"
        />
      ))}
      {isFetchingNextPage && end ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Ripple color={COLORS.tertiary} size={10} />
        </View>
      ) : null}
      {!hasNextPage && tweets.length > 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
            End of tweets.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default TweetsTab;
