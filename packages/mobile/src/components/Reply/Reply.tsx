import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import type { User, Comment as C, Reaction } from "@dispatch/api";
import { useMeStore } from "../../store";
import { APP_NAME, COLORS, FONTS, profile } from "../../constants";
import dayjs from "dayjs";
import { styles } from "../../styles";

import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { BottomSheet } from "react-native-btr";
import { trpc } from "../../utils/trpc";
import ReplySkeleton from "../skeletons/ReplySkeleton";
interface Props {
  id: string;
}
const Reply: React.FunctionComponent<Props> = ({ id }) => {
  const [open, setOpen] = React.useState(false);
  const { me } = useMeStore();
  const toggle = () => setOpen((state) => !state);
  const [form, setForm] = React.useState({ liked: false });
  const { isLoading: reacting, mutateAsync: mutateReactToReply } =
    trpc.reaction.reactToCommentReply.useMutation();
  const { isLoading: deleting, mutateAsync: mutateDeleteReply } =
    trpc.comment.deleteCommentReply.useMutation();

  const {
    refetch,
    data: reply,
    isLoading,
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

  const reactToReply = () => {
    if (!!!reply) return;
    mutateReactToReply({ id: reply.id }).then((res) => console.log({ res }));
  };

  const deleteReply = () => {
    if (!!!reply) return;
    mutateDeleteReply({ id: reply.id }).then(({ error }) => {
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
    if (!!reply && !!me) {
      const liked = reply.reactions.find((r) => r.creatorId === me.id);
      setForm((state) => ({
        ...state,
        liked: !!liked,
      }));
    }
  }, [reply, me]);

  if (!!!reply || isLoading) return <ReplySkeleton />;
  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: "80%",
        alignSelf: "flex-end",
      }}
    >
      <View
        style={{
          borderRightWidth: 1,
          position: "absolute",
          height: 20,
          borderColor: COLORS.tertiary,
        }}
      />
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
            <Text style={[styles.h1, {}]}>Reply Actions</Text>
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
                  fontSize: 16,
                  color:
                    me?.id === reply.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Report reply
            </Text>
            <Ionicons
              name="hand-left-outline"
              size={24}
              color={me?.id === reply.creator.id ? COLORS.darkGray : COLORS.red}
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
            onPress={deleteReply}
          >
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 16,
                  color:
                    me?.id !== reply.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Delete comment
            </Text>
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={me?.id !== reply.creator.id ? COLORS.darkGray : COLORS.red}
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
                  fontSize: 16,
                  color:
                    me?.id === reply.creator.id ? COLORS.darkGray : COLORS.red,
                },
              ]}
            >
              Block user
            </Text>
            <MaterialIcons
              name="block"
              size={24}
              color={me?.id === reply.creator.id ? COLORS.darkGray : COLORS.red}
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
            width: 25,
            height: 25,
            resizeMode: "contain",
            marginRight: 5,
            borderRadius: 25,
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
              {reply.creator.id === me?.id
                ? "you"
                : `@${reply.creator.nickname}`}{" "}
            </Text>
            {reply.creator.verified ? (
              <MaterialIcons name="verified" size={16} color={COLORS.primary} />
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
            size={15}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.p, { fontSize: 16, marginVertical: 3 }]}>
        {reply.text}
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
          <Ionicons name="at-outline" size={16} color={COLORS.darkGray} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={reacting}
          activeOpacity={0.7}
          onPress={reactToReply}
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
            {reply.reactions.length}
          </Text>
        </TouchableOpacity>
        <View />
      </View>
    </View>
  );
};

export default Reply;
