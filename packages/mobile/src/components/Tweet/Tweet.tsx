import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, FONTS, profile, relativeTimeObject } from "../../constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { styles } from "../../styles";
import * as Location from "expo-location";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocationStore, useMeStore, useSettingsStore } from "../../store";
import { trpc } from "../../utils/trpc";

import Poll from "../Poll/Poll";
import TweetSkeleton from "../skeletons/TweetSkeleton";
import { onImpact, playReacted } from "../../utils";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import TweetActions from "./TweetActions";
import TweetReactions from "./TweetReactions";
import { calculateDistance, distanceToReadable } from "@dispatch/shared";

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
  const { location } = useLocationStore();
  const [address, setAddress] = React.useState<
    Location.LocationGeocodedAddress | undefined
  >();
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

  const [form, setForm] = React.useState({
    height: 40,
    comment: "",
    liked: false,
    showResults: false,
    totalVotes: 0,
    expired: false,
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

  const { mutateAsync: mutateReactToTweet, isLoading: _reacting } =
    trpc.reaction.reactToTweet.useMutation();

  const viewProfile = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    navigation.navigate("User", { from: "Feed", id: tweet.userId });
  };

  const reactToTweet = async () => {
    if (settings.haptics) {
      onImpact();
    }
    if (settings.sound) {
      await playReacted();
    }
    if (!!!tweet) return;
    mutateReactToTweet({ id: tweet.id }).then(async (_res) => {});
  };

  const view = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    navigation.navigate("Tweet", { id: tweet.id, from });
  };

  React.useEffect(() => {
    if (tweet && me) {
      const liked = tweet.reactions.find((r) => r.creatorId === me.id);
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
    if (location) {
      Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }).then((data) => {
        setAddress(data[0]);
      });
    }
  }, [location]);

  if (!!!tweet || fetching) return <TweetSkeleton />;

  return (
    <TouchableOpacity
      onPress={view}
      activeOpacity={0.7}
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
        from={from}
        tweet={tweet}
        open={openSheets.actions}
        toggle={toggleActions}
      />
      <TweetReactions
        navigation={navigation}
        from={from}
        reactions={tweet.reactions}
        open={openSheets.reactions}
        toggle={toggleReactions}
      />
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
              {" • "}
            </Text>
            <Text style={[styles.p, { fontSize: 16 }]}>
              {address?.city || "Unknown"}
            </Text>
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
      <View
        style={{ marginVertical: 5, flexDirection: "row", flexWrap: "wrap" }}
      >
        {tweet.text.split(/\s/).map((word, index) => {
          if (
            tweet.mentions
              .map((u) => u.user.nickname)
              .indexOf(word.replace("@", "")) !== -1
          ) {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  const id = tweet.mentions.find(
                    (m) => m.user.nickname === word.replace("@", "")
                  )?.userId;
                  if (!!id) {
                    navigation.navigate("User", {
                      from: "Feed",
                      id,
                    });
                  }
                }}
                key={index}
              >
                <Text
                  style={[styles.h1, { fontSize: 16, color: COLORS.primary }]}
                >
                  {word}{" "}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <Text key={index} style={[styles.p, { fontSize: 16 }]}>
                {word}{" "}
              </Text>
            );
          }
        })}
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
              : `expires ${dayjs(tweet.pollExpiresIn).fromNow()}`}{" "}
            •{" "}
            {distanceToReadable(
              calculateDistance(
                {
                  lat: location?.coords.latitude ?? 0,
                  lon: location?.coords.longitude ?? 0,
                },
                { lat: tweet.lat, lon: tweet.lon }
              )
            )}
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
            {tweet.views.length || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Tweet;
