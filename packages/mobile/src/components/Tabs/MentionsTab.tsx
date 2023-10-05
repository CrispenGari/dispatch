import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { COLORS } from "../../constants";
import { useSettingsStore } from "../../store";
import { styles } from "../../styles";
import { trpc } from "../../utils/trpc";
import Ripple from "../ProgressIndicators/Ripple";
import TweetMention from "../Tweet/TweetMention";

interface Props {
  uid: string;
  navigation: StackNavigationProp<AppParamList, "User">;
}
const MentionsTab: React.FunctionComponent<Props> = ({ navigation, uid }) => {
  const { settings } = useSettingsStore();
  const {
    data,
    refetch,
    isFetching: fetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.mention.mentions.useInfiniteQuery(
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
  const [mentions, setMentions] = React.useState<
    {
      id: string;
    }[]
  >([]);
  // trpc.tweet.onNewTweet.useSubscription(
  //   { uid },
  //   {
  //     onData: async (data) => {
  //       if (!!data) {
  //         await refetch();
  //       }
  //     },
  //   }
  // );
  // trpc.tweet.onDeleteTweet.useSubscription(
  //   { uid },
  //   {
  //     onData: async (data) => {
  //       if (!!data) {
  //         await refetch();
  //       }
  //     },
  //   }
  // );
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
      setMentions(data.pages.flatMap((page) => page.mentions));
    }
  }, [data]);

  if (!!!mentions) return null;
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
      {mentions.map((mention) => (
        <TweetMention
          mention={mention}
          key={mention.id}
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
      {!hasNextPage && mentions.length > 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 18 }]}>
            End of tweets.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default MentionsTab;
