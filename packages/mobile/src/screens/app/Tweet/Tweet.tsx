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
import { BottomSheet } from "react-native-btr";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { useMeStore } from "../../../store";
import Poll from "../../../components/Poll/Poll";
import Comment from "../../../components/Comment/Comment";
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
    height: 40,
    comment: "",
    liked: false,
    showResults: false,
    totalVotes: 0,
  });

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

  if (fetching) return <Text>Fetching...</Text>;
  if (!!!tweet) return <Text>No tweet..</Text>;
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.main,
      }}
    >
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
              // onPress={editTweet}
              activeOpacity={0.7}
              // disabled={deleting}
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
                  me?.id !== tweet.creator.id ? COLORS.darkGray : COLORS.primary
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
              // disabled={deleting}
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
              // disabled={deleting}
              // onPress={deleteTweet}
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
              // disabled={deleting}
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
              width: 50,
              height: 50,
              resizeMode: "contain",
              marginRight: 5,
              borderRadius: 50,
            }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontFamily: FONTS.extraBold, fontSize: 20 }}>
                {tweet.creator.id === me?.id
                  ? "you"
                  : `@${tweet.creator.nickname}`}{" "}
              </Text>
              {tweet.creator.verified ? (
                <MaterialIcons
                  name="verified"
                  size={18}
                  color={COLORS.primary}
                />
              ) : null}
              <Text style={{ fontFamily: FONTS.extraBold, fontSize: 20 }}>
                {" "}
                •
              </Text>
              <Text style={[styles.p, { fontSize: 18 }]}>
                {" "}
                {dayjs(tweet.createdAt).fromNow()}
              </Text>
            </View>

            <Text style={[styles.p, { color: COLORS.darkGray }]}>
              {tweet.creator.email}
            </Text>
          </View>
          <TouchableOpacity
            style={{ width: 40, height: 40, marginLeft: 5, borderRadius: 40 }}
            onPress={toggle}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 5 }}>
          <Text style={[styles.p, { fontSize: 18 }]}>{tweet.text}</Text>
        </View>
        <View style={{ marginVertical: 3 }}>
          {tweet.polls.map((poll) => (
            <Poll
              totalVotes={form.totalVotes}
              tweetId={tweet.id}
              key={poll.id}
              poll={poll}
              creatorId={tweet.creator.id}
              showResults={form.showResults}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <CustomTextInput
            placeholder="Comment on this tweet..."
            containerStyles={{ flex: 1 }}
            inputStyle={{ height: form.height, maxHeight: 100 }}
            multiline
            text={form.comment}
            onContentSizeChange={(e) =>
              setForm((state) => ({
                ...state,
                height: e.nativeEvent?.contentSize?.height ?? form.height,
              }))
            }
            onChangeText={(comment) =>
              setForm((state) => ({ ...state, comment }))
            }
            // onSubmitEditing={commentOnTweet}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            // onPress={commentOnTweet}
            // disabled={commenting}
            style={[
              styles.button,
              {
                backgroundColor: COLORS.primary,
                padding: 5,
                borderRadius: 5,
                alignSelf: "flex-start",
                maxWidth: 100,
                marginLeft: 3,
              },
            ]}
          >
            <Text style={[styles.button__text]}>COMMENT</Text>
          </TouchableOpacity>
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
              size={24}
              color={COLORS.darkGray}
            />
            <Text
              style={[
                styles.h1,
                { fontSize: 18, color: COLORS.darkGray, marginLeft: 10 },
              ]}
            >
              {tweet.comments.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            // onPress={reactToTweet}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MaterialIcons
              name={form.liked ? "favorite" : "favorite-border"}
              size={24}
              color={COLORS.primary}
            />
            <Text
              style={[
                styles.h1,
                { fontSize: 18, color: COLORS.darkGray, marginLeft: 10 },
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
              size={24}
              color={COLORS.secondary}
            />
            <Text
              style={[
                styles.h1,
                { fontSize: 18, color: COLORS.darkGray, marginLeft: 10 },
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
    </ScrollView>
  );
};

export default Tweet;
