import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import {
  APP_NAME,
  COLORS,
  FONTS,
  profile,
  relativeTimeObject,
} from "../../constants";
import dayjs from "dayjs";
import { styles } from "../../styles";

import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { BottomSheet } from "react-native-btr";
import Reply from "../Reply/Reply";
import { trpc } from "../../utils/trpc";
import CommentSkeleton from "../skeletons/CommentSkeleton";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppParamList } from "../../params";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { onImpact } from "../../utils";

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
    reply: "",
    liked: false,
  });

  const [open, setOpen] = React.useState(false);
  const { me } = useMeStore();
  const toggle = () => setOpen((state) => !state);
  const { settings } = useSettingsStore();
  const { data: comment, refetch } = trpc.comment.get.useQuery({ id });
  const { mutateAsync: mutateReactToComment, isLoading: reacting } =
    trpc.reaction.reactToComment.useMutation();
  const { isLoading: deleting, mutateAsync: mutateDeleteComment } =
    trpc.comment.deleteComment.useMutation();
  const { isLoading: viewing, mutateAsync: mutateViewProfile } =
    trpc.user.viewProfile.useMutation();

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
          await refetch();
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
          await refetch();
        }
      },
    }
  );

  const reactToComment = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!comment) {
      mutateReactToComment({ id: comment.id });
    }
  };

  const replyToComment = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!form.reply.trim() || !!!comment) return;
    mutateReplyComment({ id: comment.id, reply: form.reply.trim() }).then(
      (res) => {
        if (res) {
          setForm((state) => ({ ...state, reply: "" }));
        }
      }
    );
  };
  const viewProfile = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (viewing || !!!comment) return;
    mutateViewProfile({ id: comment.userId }).then((_res) => {
      navigation.navigate("User", { from: "Tweet", id: comment.userId });
    });
  };
  const deleteComment = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!comment) return;
    mutateDeleteComment({ id: comment.id }).then(({ error }) => {
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
            <Text style={[styles.h1, {}]}>Comment Actions</Text>
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
            activeOpacity={0.7}
            disabled={deleting}
          >
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 18,
                  color:
                    me?.id === comment.creator.id
                      ? COLORS.darkGray
                      : COLORS.red,
                },
              ]}
            >
              Report comment
            </Text>
            <Ionicons
              name="hand-left-outline"
              size={24}
              color={
                me?.id === comment.creator.id ? COLORS.darkGray : COLORS.red
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
            onPress={deleteComment}
          >
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 18,
                  color:
                    me?.id !== comment.creator.id
                      ? COLORS.darkGray
                      : COLORS.red,
                },
              ]}
            >
              Delete comment
            </Text>
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={
                me?.id !== comment.creator.id ? COLORS.darkGray : COLORS.red
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
                    me?.id === comment.creator.id
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
                me?.id === comment.creator.id ? COLORS.darkGray : COLORS.red
              }
            />
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={reactToComment}
          disabled={reacting}
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
              { fontSize: 14, color: COLORS.darkGray, marginLeft: 10 },
            ]}
          >
            {comment.reactions.length}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        </View>
      </View>

      {comment.replies.map(({ id }) => (
        <Reply key={id} id={id} navigation={navigation} />
      ))}

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
          text={form.reply}
          onContentSizeChange={(e) => {
            e.persist();
            setForm((state) => ({
              ...state,
              height: e.nativeEvent?.contentSize?.height + 20 ?? form.height,
            }));
          }}
          onChangeText={(reply) => setForm((state) => ({ ...state, reply }))}
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
