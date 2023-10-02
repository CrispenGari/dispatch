import {
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import React from "react";

import { COLORS, FONTS, profile, relativeTimeObject } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";
import { trpc } from "../../../utils/trpc";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { useMeStore, useSettingsStore } from "../../../store";
import Poll from "../../../components/Poll/Poll";
import Comment from "../../../components/Comment/Comment";
import TweetSkeleton from "../../../components/skeletons/TweetSkeleton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ContentLoader from "../../../components/ContentLoader/ContentLoader";
import { onImpact, playReacted, playTweeted } from "../../../utils";
import type { AppNavProps } from "../../../params";
import TweetActions from "../../../components/Tweet/TweetActions";
import TweetReactions from "../../../components/Tweet/TweetReactions";
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
  const { me } = useMeStore();
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
  const { settings } = useSettingsStore();

  const [form, setForm] = React.useState({
    height: 60,
    comment: "",
    liked: false,
    showResults: false,
    totalVotes: 0,
    expired: false,
  });
  const { mutateAsync: mutateReactToTweet, isLoading: reacting } =
    trpc.reaction.reactToTweet.useMutation();
  const { mutateAsync: mutateCommentOnTweet, isLoading: commenting } =
    trpc.comment.comment.useMutation();

  const { mutateAsync: mutateViewTweet, isLoading: viewing } =
    trpc.tweet.view.useMutation();

  const reactToTweet = async () => {
    if (settings.haptics) {
      onImpact();
    }
    if (settings.sound) {
      await playReacted();
    }
    if (!!!tweet || reacting) return;
    mutateReactToTweet({ id: tweet.id });
  };
  const commentOnTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    if (!!!form.comment.trim()) return;
    mutateCommentOnTweet({ comment: form.comment, id: tweet.id }).then(
      async (res) => {
        if (res) {
          if (settings.sound) {
            await playTweeted().then(() => {
              setForm((state) => ({ ...state, comment: "" }));
            });
          } else {
            setForm((state) => ({ ...state, comment: "" }));
          }
        }
      }
    );
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
  trpc.comment.onCommentDelete.useSubscription(
    { uid: me?.id || "", tweetId: tweet?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
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
  React.useEffect(() => {
    if (!!tweet) {
      mutateViewTweet({ id: tweet.id });
    }
  }, [tweet]);
  const viewProfile = () => {
    if (viewing || !!!tweet) return;
    navigation.navigate("User", { from: "Tweet", id: tweet.userId });
  };
  if (fetching || !!!tweet) return <TweetSkeleton />;
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          shouldRasterizeIOS={true}
          refreshing={fetching || _fetching}
          onRefresh={async () => {
            await refetch();
          }}
        />
      }
      style={{ backgroundColor: COLORS.main, flex: 1, position: "relative" }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            maxWidth: 500,
            padding: 5,
            marginBottom: 1,
            borderBottomColor: COLORS.tertiary,
            borderBottomWidth: 0.5,
            paddingTop: 10,
          }}
        >
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
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <TouchableOpacity activeOpacity={0.7} onPress={viewProfile}>
              <Image
                source={{
                  uri: Image.resolveAssetSource(profile).uri,
                }}
                style={{
                  width: 40,
                  height: 40,
                  resizeMode: "contain",
                  marginRight: 5,
                  borderRadius: 40,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.7}
              onPress={viewProfile}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
                  {tweet.creator.id === me?.id
                    ? "you"
                    : `@${tweet.creator.nickname}`}{" "}
                </Text>
                {tweet.creator.verified ? (
                  <MaterialIcons
                    name="verified"
                    size={14}
                    color={COLORS.primary}
                  />
                ) : null}
                <Text style={{ fontFamily: FONTS.extraBold, fontSize: 20 }}>
                  {" "}
                  •
                </Text>
                <Text style={[styles.p, { fontSize: 16 }]}>
                  {" "}
                  {dayjs(tweet.createdAt).fromNow()}
                </Text>
              </View>

              <Text
                style={[styles.p, { color: COLORS.darkGray, fontSize: 14 }]}
              >
                {tweet.creator.email}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                marginLeft: 5,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                toggleActions();
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={16}
                color="black"
              />
            </TouchableOpacity>
          </View>
          <View style={{ marginVertical: 5 }}>
            <Text style={[styles.p, { fontSize: 16 }]}>{tweet.text}</Text>
          </View>
          <View style={{ marginVertical: 3 }}>
            {tweet.polls.map((poll) => (
              <Poll
                tweetId={tweet.id}
                key={poll.id}
                poll={poll}
                showResults={form.showResults}
                creatorId={tweet.creator.id}
                tweet={tweet}
                refetch={refetch}
                totalVotes={tweet.polls.flatMap((p) => p.votes).length}
              />
            ))}
            {tweet.polls.length ? (
              <Text
                style={[
                  styles.p,
                  {
                    marginVertical: 2,
                    fontSize: 16,
                    color: COLORS.darkGray,
                  },
                ]}
              >
                {tweet.polls.flatMap((p) => p.votes).length} votes •{" "}
                {form.expired
                  ? "expired"
                  : `expires ${dayjs(tweet.pollExpiresIn).fromNow()}`}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialCommunityIcons
                name="comment-quote-outline"
                size={16}
                color={COLORS.darkGray}
              />
              <Text
                style={[
                  styles.h1,
                  { fontSize: 14, color: COLORS.darkGray, marginLeft: 10 },
                ]}
              >
                {tweet.comments.length}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={reactToTweet}
              >
                <MaterialIcons
                  name={form.liked ? "favorite" : "favorite-border"}
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center" }}
                activeOpacity={0.7}
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  toggleReactions();
                }}
              >
                <Text
                  style={[
                    styles.h1,
                    {
                      fontSize: 16,
                      color: COLORS.darkGray,
                      marginLeft: 10,
                      marginTop: -3,
                      width: 30,
                    },
                  ]}
                >
                  {tweet.reactions.length}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons
                name="ios-stats-chart-outline"
                size={16}
                color={COLORS.secondary}
              />
              <Text
                style={[
                  styles.h1,
                  { fontSize: 16, color: COLORS.darkGray, marginLeft: 10 },
                ]}
              >
                {tweet.views}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
                text={form.comment}
                onContentSizeChange={(e) => {
                  e.persist();
                  setForm((state) => ({
                    ...state,
                    height:
                      e.nativeEvent?.contentSize?.height + 20 ?? form.height,
                  }));
                }}
                onChangeText={(comment) =>
                  setForm((state) => ({ ...state, comment }))
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

        {tweet.comments.map(({ id }) => (
          <Comment key={id} id={id} navigation={navigation} />
        ))}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Tweet;
