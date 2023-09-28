import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import React from "react";
import {
  APP_NAME,
  COLORS,
  FONTS,
  profile,
  relativeTimeObject,
} from "../../constants";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { styles } from "../../styles";
import { BottomSheet } from "react-native-btr";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useMeStore, useSettingsStore } from "../../store";
import { trpc } from "../../utils/trpc";

import Poll from "../Poll/Poll";
import TweetSkeleton from "../skeletons/TweetSkeleton";
import { onImpact } from "../../utils";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
  tweet: { id: string };
  from: keyof AppParamList;
}
const Tweet: React.FunctionComponent<Props> = ({
  tweet: { id },
  navigation,
  from,
}) => {
  const { settings } = useSettingsStore();
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
  const {
    isLoading: fetching,
    data: tweet,
    refetch,
  } = trpc.tweet.tweet.useQuery({
    id,
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

  trpc.comment.onTweetComment.useSubscription(
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

  const { mutateAsync: mutateDeleteTweet, isLoading: deleting } =
    trpc.tweet.del.useMutation();
  const { mutateAsync: mutateReactToTweet, isLoading: _reacting } =
    trpc.reaction.reactToTweet.useMutation();
  const { mutateAsync: mutateViewTweet, isLoading: viewing } =
    trpc.tweet.view.useMutation();

  const { isLoading: viewingP, mutateAsync: mutateViewProfile } =
    trpc.user.viewProfile.useMutation();

  const viewProfile = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (viewingP || !!!tweet) return;
    mutateViewProfile({ id: tweet.userId }).then((_res) => {
      navigation.navigate("User", { from: "Tweet", id: tweet.userId });
    });
  };
  const deleteTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
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
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    if (me?.id === tweet.creator.id) {
      navigation.navigate("Edit", { id: tweet.id, from });
      toggle();
    }
  };

  const reactToTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    mutateReactToTweet({ id: tweet.id }).then((_res) => {});
  };

  const view = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    mutateViewTweet({ id: tweet.id }).then((_res) => {
      navigation.navigate("Tweet", { id: tweet.id, from });
    });
  };

  React.useEffect(() => {
    if (tweet && me) {
      const liked = tweet.reactions.find((r) => r.creatorId === me.id);
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

  if (!!!tweet || fetching) return <TweetSkeleton />;

  return (
    <TouchableOpacity
      onPress={view}
      activeOpacity={0.7}
      disabled={viewing}
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
        onBackButtonPress={() => {
          if (settings.haptics) {
            onImpact();
          }
          toggle();
        }}
        onBackdropPress={() => {
          if (settings.haptics) {
            onImpact();
          }
          toggle();
        }}
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
            disabled={deleting}
          >
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 18,
                  color:
                    me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Report tweet
            </Text>
            <Ionicons
              name="hand-left-outline"
              size={24}
              color={me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red}
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
                    me?.id !== tweet.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Delete tweet
            </Text>
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={me?.id !== tweet.creator.id ? COLORS.darkGray : COLORS.red}
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
                    me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Block user
            </Text>
            <MaterialIcons
              name="block"
              size={24}
              color={me?.id === tweet.creator.id ? COLORS.darkGray : COLORS.red}
            />
          </TouchableOpacity>
        </View>
      </BottomSheet>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity onPress={viewProfile} activeOpacity={0.7}>
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
          onPress={viewProfile}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
              {tweet.creator.id === me?.id
                ? "you"
                : `@${tweet.creator.nickname}`}{" "}
            </Text>
            {tweet.creator.verified ? (
              <MaterialIcons name="verified" size={14} color={COLORS.primary} />
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

          <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 14 }]}>
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
            toggle();
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={reactToTweet}
          style={{ flexDirection: "row", alignItems: "center" }}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Tweet;
