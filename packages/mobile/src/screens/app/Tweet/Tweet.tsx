import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import React from "react";
import { COLORS, FONTS, relativeTimeObject } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { useDebounce, usePlatform } from "../../../hooks";
import { trpc } from "../../../utils/trpc";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import TweetComponent from "../../../components/Tweet/Tweet";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { useMeStore, useSettingsStore } from "../../../store";

import Comment from "../../../components/Comment/Comment";
import TweetSkeleton from "../../../components/skeletons/TweetSkeleton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ContentLoader from "../../../components/ContentLoader/ContentLoader";
import { onImpact, playTweeted } from "../../../utils";
import type { AppNavProps } from "../../../params";
import TweetActions from "../../../components/Tweet/TweetActions";
import TweetReactions from "../../../components/Tweet/TweetReactions";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import Mentions from "../../../components/BottomSheets/Mentions";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

const Tweet: React.FunctionComponent<AppNavProps<"Tweet">> = ({
  navigation,
  route,
}) => {
  const { os } = usePlatform();
  const { settings } = useSettingsStore();
  const { me } = useMeStore();
  const {
    isLoading: fetching,
    refetch,
    data: tweet,
    isFetching: _fetching,
  } = trpc.tweet.tweet.useQuery({ id: route.params.id });
  const [openSheets, setOpenSheets] = React.useState({
    actions: false,
    reactions: false,
  });

  const toggleActions = () =>
    setOpenSheets((state) => ({
      ...state,
      actions: !openSheets.actions,
    }));
  const toggleReactions = () =>
    setOpenSheets((state) => ({
      ...state,
      reactions: !openSheets.reactions,
    }));
  const [comments, setComments] = React.useState<
    {
      id: string;
    }[]
  >([]);
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchComments,
  } = trpc.comment.comments.useInfiniteQuery(
    {
      tweetId: route.params.id,
      limit: settings.pageLimit,
    },
    {
      keepPreviousData: true,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  );

  React.useEffect(() => {
    if (!!data?.pages) {
      setComments(data.pages.flatMap((page) => page.comments));
    }
  }, [data]);
  const [form, setForm] = React.useState({
    height: 60,
    text: "",
    liked: false,
    showResults: false,
    totalVotes: 0,
    expired: false,
    viewCount: 0,
    end: false,
    mentions: [] as string[],
  });
  const nickname = useDebounce(
    form.text.split(/\s/).pop()?.startsWith("@")
      ? form.text.split(/\s/).pop()
      : undefined,
    500
  );

  const { mutateAsync: mutateCommentOnTweet, isLoading: commenting } =
    trpc.comment.comment.useMutation();
  const { mutateAsync: mutateViewTweet } = trpc.tweet.view.useMutation();

  const commentOnTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    if (!!!form.text.trim()) return;
    mutateCommentOnTweet({
      comment: form.text,
      id: tweet.id,
      mentions: [...new Set(form.mentions)],
    }).then(async (res) => {
      if (res) {
        if (settings.sound) {
          await playTweeted().then(() => {
            setForm((state) => ({ ...state, text: "", mentions: [] }));
          });
        } else {
          setForm((state) => ({ ...state, text: "", mentions: [] }));
        }
      }
    });
  };

  trpc.tweet.onTweetUpdate.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.reaction.onTweetReaction.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.tweet.onView.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.poll.onVote.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.comment.onTweetComment.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetchComments();
        }
      },
    }
  );
  trpc.comment.onCommentDelete.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await Promise.all([refetch(), refetchComments()]);
        }
      },
    }
  );

  const onScroll = async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    const paddingToBottom = 10;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const close =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setForm((state) => ({ ...state, end: close }));
    if (close && hasNextPage) {
      await fetchNextPage();
    }
  };
  React.useEffect(() => {
    if (!!tweet && form.viewCount <= 0) {
      mutateViewTweet({ id: tweet.id }).then((_res) => {
        setForm((state) => ({ ...state, viewCount: state.viewCount + 1 }));
      });
    }
  }, [tweet]);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "View Tweet",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0.5,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? route.params.from : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, route, settings]);

  React.useEffect(() => {
    if (!!tweet) {
      const liked = tweet.reactions.find((r) => r.creatorId === me?.id);
      const voted = !!tweet.polls
        .flatMap((p) => p.votes)
        .find((v) => v.userId === me?.id);

      const expired =
        dayjs(tweet.pollExpiresIn).toDate().getTime() -
          dayjs().toDate().getTime() <=
        0;

      setForm((state) => ({
        ...state,
        liked: !!liked,
        showResults: me?.id === tweet.creator.id || voted || expired,
        totalVotes: tweet.polls.flatMap((p) => p.votes).length,
        expired,
      }));
    }
  }, [tweet, me]);

  if (fetching || !!!tweet) return <TweetSkeleton />;
  return (
    <View
      style={{ flex: 1, alignSelf: "center", width: "100%", maxWidth: 500 }}
    >
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            shouldRasterizeIOS={true}
            refreshing={fetching}
            onRefresh={async () => {
              await refetch();
            }}
          />
        }
        style={{ backgroundColor: COLORS.main, flex: 1, position: "relative" }}
      >
        {!!nickname && !!nickname.replace("@", "") ? (
          <Mentions
            nickname={nickname.replace("@", "")}
            setForm={setForm as any}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <TweetActions
            navigation={navigation}
            from={"Tweet"}
            tweet={tweet}
            open={openSheets.actions}
            toggle={toggleActions}
          />
          <TweetReactions
            navigation={navigation}
            from={"Tweet"}
            reactions={tweet.reactions}
            open={openSheets.reactions}
            toggle={toggleReactions}
          />
          <TweetComponent
            from="Tweet"
            navigation={navigation}
            tweet={{ id: route.params.id }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 10,
              maxWidth: 500,
            }}
          >
            {!!!tweet ? (
              <>
                <ContentLoader
                  style={{
                    height: 30,
                    backgroundColor: COLORS.loaderGray,
                    marginRight: 3,
                    borderRadius: 5,
                    flex: 1,
                  }}
                />
                <ContentLoader
                  style={{
                    height: 25,
                    backgroundColor: COLORS.loaderGray,
                    marginRight: 3,
                    borderRadius: 5,
                    padding: 5,
                    width: "100%",
                    alignSelf: "flex-start",
                    maxWidth: 60,
                    marginLeft: 3,
                  }}
                />
              </>
            ) : (
              <>
                <CustomTextInput
                  placeholder="Comment on this tweet..."
                  containerStyles={{ flex: 1 }}
                  inputStyle={{ maxHeight: 100 }}
                  multiline
                  text={form.text}
                  onContentSizeChange={(e) => {
                    e.persist();
                    setForm((state) => ({
                      ...state,
                      height:
                        e.nativeEvent?.contentSize?.height + 20 ?? form.height,
                    }));
                  }}
                  onChangeText={(comment) =>
                    setForm((state) => ({ ...state, text: comment }))
                  }
                  onSubmitEditing={commentOnTweet}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={commentOnTweet}
                  disabled={commenting}
                  style={[
                    styles.button,
                    {
                      backgroundColor: COLORS.primary,
                      padding: 5,
                      borderRadius: 5,
                      alignSelf: "flex-start",
                      maxWidth: 80,
                      marginLeft: 3,
                    },
                  ]}
                >
                  <Text style={[styles.button__text, { fontSize: 14 }]}>
                    COMMENT
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {comments.map(({ id }) => (
            <Comment key={id} id={id} navigation={navigation} />
          ))}
        </View>

        {isFetchingNextPage && form.end ? (
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

        {!hasNextPage && comments.length > 0 ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
              End of comments.
            </Text>
          </View>
        ) : null}
        {_fetching ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
              Loading comments...
            </Text>
          </View>
        ) : null}

        {comments.length === 0 && !_fetching ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
              No comments.
            </Text>
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Tweet;
