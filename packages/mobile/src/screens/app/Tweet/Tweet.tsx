import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React from "react";
import { AppNavProps } from "../../../params";
import {
  APP_NAME,
  COLORS,
  FONTS,
  profile,
  relativeTimeObject,
} from "../../../constants";
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
import { BottomSheet } from "react-native-btr";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { useMeStore } from "../../../store";
import Poll from "../../../components/Poll/Poll";
import Comment from "../../../components/Comment/Comment";
import TweetSkeleton from "../../../components/skeletons/TweetSkeleton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ContentLoader from "../../../components/ContentLoader/ContentLoader";
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
  } = trpc.tweet.tweet.useQuery({ id: route.params.id });
  const [open, setOpen] = React.useState(false);
  const { me } = useMeStore();
  const toggle = () => setOpen((state) => !state);
  const [form, setForm] = React.useState({
    height: 60,
    comment: "",
    liked: false,
    showResults: false,
    totalVotes: 0,
  });

  const { mutateAsync: mutateDeleteTweet, isLoading: deleting } =
    trpc.tweet.del.useMutation();
  const { mutateAsync: mutateReactToTweet, isLoading: reacting } =
    trpc.reaction.reactToTweet.useMutation();
  const { mutateAsync: mutateCommentOnTweet, isLoading: commenting } =
    trpc.comment.comment.useMutation();

  const deleteTweet = () => {
    if (!!!tweet) return;
    mutateDeleteTweet({ id: tweet.id }).then(({ error }) => {
      if (error) {
        Alert.alert(
          APP_NAME,
          error,
          [
            {
              style: "default",
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      }
      toggle();
    });
  };
  const editTweet = () => {
    if (!!!tweet) return;
    if (me?.id === tweet.creator.id) {
      navigation.navigate("Edit", { id: tweet.id });
      toggle();
    }
  };

  const reactToTweet = () => {
    if (!!!tweet) return;
    mutateReactToTweet({ id: tweet.id }).then((res) => {
      console.log({ res });
    });
  };
  const commentOnTweet = () => {
    if (!!!tweet) return;
    if (!!!form.comment.trim()) return;
    mutateCommentOnTweet({ comment: form.comment, id: tweet.id }).then(
      (res) => {
        if (res) {
          setForm((state) => ({ ...state, comment: "" }));
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
          label={os === "ios" ? "Feed" : ""}
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  React.useEffect(() => {
    if (!!tweet) {
      const liked = tweet.reactions.find((r) => r.creatorId === me?.id);
      const voted = !!tweet.polls
        .flatMap((p) => p.votes)
        .find((v) => v.userId === me?.id);
      setForm((state) => ({
        ...state,
        liked: !!liked,
        showResults: me?.id === tweet.creator.id || voted,
        totalVotes: tweet.polls.flatMap((p) => p.votes).length,
      }));
    }
  }, [tweet, me]);
  if (fetching || !!!tweet) return <TweetSkeleton />;
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
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
          <BottomSheet
            visible={!!open}
            onBackButtonPress={toggle}
            onBackdropPress={toggle}
          >
            <View
              style={{
                height: 200,
                backgroundColor: COLORS.main,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  borderRadius: 999,
                  padding: 5,
                  alignSelf: "center",
                  top: -10,
                  backgroundColor: COLORS.main,
                  paddingHorizontal: 15,
                  shadowOffset: { height: 2, width: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 2,
                  shadowColor: COLORS.primary,
                  elevation: 1,
                }}
              >
                <Text style={[styles.h1, {}]}>Tweet Actions</Text>
              </View>
              <View style={{ height: 10 }} />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 1,
                }}
                onPress={editTweet}
                activeOpacity={0.7}
                disabled={deleting}
              >
                <Text
                  style={[
                    styles.h1,
                    {
                      fontSize: 18,
                      color:
                        me?.id !== tweet.creator.id
                          ? COLORS.darkGray
                          : COLORS.primary,
                    },
                  ]}
                >
                  Edit tweet
                </Text>

                <MaterialCommunityIcons
                  name="file-edit-outline"
                  size={24}
                  color={
                    me?.id !== tweet.creator.id
                      ? COLORS.darkGray
                      : COLORS.primary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 1,
                }}
                activeOpacity={0.7}
                disabled={deleting}
              >
                <Text
                  style={[
                    styles.h1,
                    {
                      fontSize: 18,
                      color:
                        me?.id === tweet.creator.id
                          ? COLORS.darkGray
                          : COLORS.red,
                    },
                  ]}
                >
                  Report tweet
                </Text>
                <Ionicons
                  name="hand-left-outline"
                  size={24}
                  color={
                    me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 1,
                }}
                activeOpacity={0.7}
                disabled={deleting}
                onPress={deleteTweet}
              >
                <Text
                  style={[
                    styles.h1,
                    {
                      fontSize: 18,
                      color:
                        me?.id !== tweet.creator.id
                          ? COLORS.darkGray
                          : COLORS.red,
                    },
                  ]}
                >
                  Delete tweet
                </Text>
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={
                    me?.id !== tweet.creator.id ? COLORS.darkGray : COLORS.red
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 1,
                }}
                activeOpacity={0.7}
                disabled={deleting}
              >
                <Text
                  style={[
                    styles.h1,
                    {
                      fontSize: 18,
                      color:
                        me?.id === tweet.creator.id
                          ? COLORS.darkGray
                          : COLORS.red,
                    },
                  ]}
                >
                  Block user
                </Text>
                <MaterialIcons
                  name="block"
                  size={24}
                  color={
                    me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red
                  }
                />
              </TouchableOpacity>
            </View>
          </BottomSheet>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
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
            <View style={{ flex: 1 }}>
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
            </View>
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                marginLeft: 5,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={toggle}
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
                {tweet.polls.flatMap((p) => p.votes).length} votes
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={reactToTweet}
              style={{ flexDirection: "row", alignItems: "center" }}
              disabled={reacting}
            >
              <MaterialIcons
                name={form.liked ? "favorite" : "favorite-border"}
                size={16}
                color={COLORS.primary}
              />
              <Text
                style={[
                  styles.h1,
                  { fontSize: 16, color: COLORS.darkGray, marginLeft: 10 },
                ]}
              >
                {tweet.reactions.length}
              </Text>
            </TouchableOpacity>
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

        {tweet.comments.map(({ id }) => (
          <Comment key={id} id={id} />
        ))}
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
    </KeyboardAwareScrollView>
  );
};

export default Tweet;
