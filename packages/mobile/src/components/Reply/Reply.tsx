import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import { COLORS, FONTS, profile, relativeTimeObject } from "../../constants";
import dayjs from "dayjs";
import { styles } from "../../styles";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { trpc } from "../../utils/trpc";
import ReplySkeleton from "../skeletons/ReplySkeleton";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { onImpact, playReacted } from "../../utils";
import ReplyActions from "./ReplyActions";
import ReplyReactions from "./ReplyReactions";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  id: string;

  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
  updateForm: React.Dispatch<
    React.SetStateAction<{
      height: number;
      text: string;
      liked: boolean;
      mentions: string[];
    }>
  >;
}
const Reply: React.FunctionComponent<Props> = ({
  id,
  navigation,
  updateForm,
}) => {
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

  const [form, setForm] = React.useState({ liked: false });
  const { isLoading: reacting, mutateAsync: mutateReactToReply } =
    trpc.reaction.reactToCommentReply.useMutation();

  const {
    refetch,
    data: reply,
    isFetching: fetching,
  } = trpc.comment.getReply.useQuery({ id });

  trpc.reaction.onTweetCommentReplyReaction.useSubscription(
    {
      uid: me?.id || "",
      replyId: reply?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );

  const reactToReply = async () => {
    if (settings.haptics) {
      onImpact();
    }
    if (settings.sound) {
      await playReacted();
    }
    if (!!!reply || reacting) return;
    mutateReactToReply({ id: reply.id }).then(async (_res) => {});
  };

  const viewProfile = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!reply) return;
    navigation.navigate("User", { from: "Tweet", id: reply.userId });
  };

  const mentionHim = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!me || !!!reply) return;
    if (me.id === reply.userId) return;

    updateForm((state) => ({
      ...state,
      mentions: [reply.creator.nickname, ...state.mentions],
      text: `${state.text.concat(`@${reply.creator.nickname} `)}`,
    }));
  };

  React.useEffect(() => {
    if (!!reply && !!me) {
      const liked = reply.reactions.find((r) => r.creatorId === me.id);
      setForm((state) => ({
        ...state,
        liked: !!liked,
      }));
    }
  }, [reply, me]);

  if (fetching) return <ReplySkeleton />;
  if (!!!reply) return null;
  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: "80%",
        alignSelf: "flex-end",
      }}
    >
      <ReplyActions
        open={openSheets.actions}
        toggle={toggleActions}
        reply={reply}
      />
      <ReplyReactions
        open={openSheets.reactions}
        toggle={toggleReactions}
        navigation={navigation}
        from={"Tweet"}
        reactions={reply.reactions}
      />
      <View
        style={{
          borderRightWidth: 1,
          position: "absolute",
          height: 20,
          borderColor: COLORS.tertiary,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity activeOpacity={0.7} onPress={viewProfile}>
          <Image
            source={{
              uri: Image.resolveAssetSource(profile).uri,
            }}
            style={{
              width: 25,
              height: 25,
              resizeMode: "contain",
              marginRight: 5,
              borderRadius: 25,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={0.7}
          onPress={viewProfile}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
              {reply.creator.id === me?.id
                ? "you"
                : `@${reply.creator.nickname}`}{" "}
            </Text>
            {reply.creator.verified ? (
              <MaterialIcons name="verified" size={14} color={COLORS.primary} />
            ) : null}
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
              {" "}
              •
            </Text>
            <Text style={[styles.p, { fontSize: 16 }]}>
              {" "}
              {dayjs(reply.createdAt).fromNow()}
            </Text>
          </View>

          <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
            {reply.creator.email}
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
            size={15}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <View
        style={{ marginVertical: 5, flexDirection: "row", flexWrap: "wrap" }}
      >
        {reply.text.split(/\s/).map((word, index) => {
          if (
            reply.mentions
              ?.map((u) => u.user.nickname)
              .indexOf(word.replace("@", "")) !== -1
          ) {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  const id = reply.mentions.find(
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
                  style={[styles.h1, { fontSize: 14, color: COLORS.primary }]}
                >
                  {word}{" "}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <Text key={index} style={[styles.p, { fontSize: 14 }]}>
                {word}{" "}
              </Text>
            );
          }
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          marginVertical: 5,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={mentionHim}
        >
          <Ionicons name="at-outline" size={16} color={COLORS.darkGray} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={reactToReply}
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
              {reply.reactions.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View />
      </View>
    </View>
  );
};

export default Reply;
