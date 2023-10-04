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

import Reply from "../Reply/Reply";
import { trpc } from "../../utils/trpc";
import CommentSkeleton from "../skeletons/CommentSkeleton";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { onImpact, playReacted, playTweeted } from "../../utils";
import CommentAction from "./CommentAction";
import CommentReactions from "./CommentReactions";
import ReplyContributors from "../Reply/ReplyContributors";
import type { User } from "@dispatch/api";
import Ripple from "../ProgressIndicators/Ripple";
import { useDebounce } from "../../hooks";
import Mentions from "../BottomSheets/Mentions";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  id: string;
  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
}
const Comment: React.FunctionComponent<Props> = ({ id, navigation }) => {
  const [form, setForm] = React.useState({
    height: 40,
    text: "",
    liked: false,
    mentions: [] as string[],
  });

  const nickname = useDebounce(
    form.text.split(/\s/).pop()?.startsWith("@")
      ? form.text.split(/\s/).pop()
      : undefined,
    500
  );
  const [openSheets, setOpenSheets] = React.useState({
    actions: false,
    reactions: false,
    contributors: false,
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
  const toggleContributors = () =>
    setOpenSheets((state) => ({
      ...state,
      contributors: !openSheets.contributors,
    }));

  const { settings } = useSettingsStore();
  const [replies, setReplies] = React.useState<
    {
      id: string;
    }[]
  >([]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch: refetchReplies,
    isFetchingNextPage,
  } = trpc.comment.replies.useInfiniteQuery(
    {
      commentId: id,
      limit: settings.pageLimit,
    },
    {
      keepPreviousData: true,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  );
  React.useEffect(() => {
    if (!!data?.pages) {
      setReplies(data.pages.flatMap((page) => page.replies));
    }
  }, [data]);
  const { data: comment, refetch } = trpc.comment.get.useQuery({ id });
  const { mutateAsync: mutateReactToComment, isLoading: reacting } =
    trpc.reaction.reactToComment.useMutation();

  const { isLoading: replying, mutateAsync: mutateReplyComment } =
    trpc.comment.reply.useMutation();
  trpc.reaction.onTweetCommentReaction.useSubscription(
    {
      uid: me?.id || "",
      commentId: comment?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.comment.onCommentReply.useSubscription(
    {
      uid: me?.id || "",
      commentId: comment?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await Promise.all([refetch(), refetchReplies()]);
        }
      },
    }
  );
  trpc.comment.onCommentReplyDelete.useSubscription(
    {
      uid: me?.id || "",
      commentId: comment?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await Promise.all([refetch(), refetchReplies()]);
        }
      },
    }
  );

  const reactToComment = async () => {
    if (settings.haptics) {
      onImpact();
    }
    if (settings.sound) {
      await playReacted();
    }
    if (reacting) return;
    if (!!comment) {
      mutateReactToComment({ id: comment.id }).then(async (_res) => {});
    }
  };

  const replyToComment = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!form.text.trim() || !!!comment) return;
    mutateReplyComment({
      id: comment.id,
      reply: form.text.trim(),
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
  const viewProfile = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!comment) return;

    navigation.navigate("User", { from: "Tweet", id: comment.userId });
  };

  const moreReplies = async () => {
    if (!hasNextPage) return;
    await fetchNextPage();
  };

  React.useEffect(() => {
    if (!!comment && !!me) {
      const liked = !!comment.reactions.find(
        ({ creatorId }) => creatorId === me.id
      );
      setForm((state) => ({ ...state, liked: liked }));
    }
  }, [comment, me]);

  if (!!!comment) return <CommentSkeleton />;

  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderBlockColor: COLORS.tertiary,
        borderBottomWidth: 0.5,
        maxWidth: 500,
      }}
    >
      {!!nickname && !!nickname.replace("@", "") ? (
        <Mentions
          nickname={nickname.replace("@", "")}
          setForm={setForm as any}
        />
      ) : null}
      <CommentAction
        comment={comment}
        open={openSheets.actions}
        toggle={toggleActions}
      />
      <CommentReactions
        reactions={comment.reactions}
        open={openSheets.reactions}
        toggle={toggleReactions}
        from="Tweet"
        navigation={navigation}
      />
      <ReplyContributors
        contributors={[
          ...new Set(
            comment.replies.map((reply) => JSON.stringify(reply.creator))
          ),
        ].map((v) => JSON.parse(v) as User)}
        open={openSheets.contributors}
        toggle={toggleContributors}
        from="Tweet"
        navigation={navigation}
      />
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity activeOpacity={0.7} onPress={viewProfile}>
          <Image
            source={{
              uri: Image.resolveAssetSource(profile).uri,
            }}
            style={{
              width: 30,
              height: 30,
              resizeMode: "contain",
              marginRight: 5,
              borderRadius: 30,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={viewProfile}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
              {comment.creator.id === me?.id
                ? "you"
                : `@${comment.creator.nickname}`}{" "}
            </Text>
            {comment.creator.verified ? (
              <MaterialIcons name="verified" size={14} color={COLORS.primary} />
            ) : null}
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
              {" "}
              •
            </Text>
            <Text style={[styles.p, { fontSize: 14 }]}>
              {" "}
              {dayjs(comment.createdAt).fromNow()}
            </Text>
          </View>

          <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
            {comment.creator.email}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            marginLeft: 5,
            borderRadius: 30,
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
      <Text style={[styles.p, { fontSize: 16, marginVertical: 3 }]}>
        {comment.text}
      </Text>
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
        >
          <MaterialCommunityIcons
            name="reply-outline"
            size={16}
            color={COLORS.darkGray}
          />

          <Text
            style={[
              styles.h1,
              { fontSize: 14, color: COLORS.darkGray, marginLeft: 10 },
            ]}
          >
            {comment.replies.length}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={reactToComment}
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
              {comment.reactions.length}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            toggleContributors();
          }}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name="ios-people-outline"
            size={16}
            color={COLORS.darkGray}
          />
          <Text
            style={[
              styles.h1,
              { fontSize: 14, color: COLORS.darkGray, marginLeft: 10 },
            ]}
          >
            {new Set(comment.replies.map((r) => r.userId)).size}
          </Text>
        </TouchableOpacity>
      </View>

      {replies.map(({ id }) => (
        <Reply key={id} id={id} navigation={navigation} />
      ))}

      {isFetchingNextPage ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 5,
          }}
        >
          <Ripple color={COLORS.tertiary} size={5} />
        </View>
      ) : null}
      {hasNextPage && !isFetchingNextPage ? (
        <TouchableOpacity
          style={{
            paddingVertical: 5,
            width: "80%",
            alignSelf: "flex-end",
          }}
          activeOpacity={0.7}
          onPress={moreReplies}
        >
          <Text
            style={[
              styles.h1,
              {
                color: COLORS.primary,
              },
            ]}
          >
            More Replies
          </Text>
        </TouchableOpacity>
      ) : null}

      {!hasNextPage && replies.length > 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
            End of replies.
          </Text>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 10,
          paddingVertical: 10,
          alignSelf: "flex-end",
          width: "90%",
        }}
      >
        <CustomTextInput
          placeholder="Reply on this comment..."
          containerStyles={{ flex: 1 }}
          inputStyle={{ maxHeight: 100 }}
          multiline
          text={form.text}
          onContentSizeChange={(e) => {
            e.persist();
            setForm((state) => ({
              ...state,
              height: e.nativeEvent?.contentSize?.height + 20 ?? form.height,
            }));
          }}
          onChangeText={(reply) =>
            setForm((state) => ({ ...state, text: reply }))
          }
          onSubmitEditing={replyToComment}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={replyToComment}
          disabled={replying}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 5,
              borderRadius: 5,
              alignSelf: "flex-start",
              maxWidth: 60,
              marginLeft: 3,
            },
          ]}
        >
          <Text style={[styles.button__text, { fontSize: 12 }]}>REPLY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Comment;
