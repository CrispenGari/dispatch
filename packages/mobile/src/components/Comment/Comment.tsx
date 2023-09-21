import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import type { User, Comment as C, Reaction } from "@dispatch/api";
import { useMeStore } from "../../store";
import { COLORS, FONTS, profile } from "../../constants";
import dayjs from "dayjs";
import { styles } from "../../styles";

import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { BottomSheet } from "react-native-btr";
import Reply from "../Reply/Reply";

interface Props {
  comment: Partial<C> & {
    creator: User;
    reactions: Partial<Reaction> & { creator: User }[];
    replies: Partial<C> &
      { creator: User; reactions: Partial<Reaction> & { creator: User }[] }[];
  };
}
const Comment: React.FunctionComponent<Props> = ({ comment }) => {
  const [open, setOpen] = React.useState(false);
  const { me } = useMeStore();
  const toggle = () => setOpen((state) => !state);
  const [form, setForm] = React.useState({ liked: false });
  return (
    <View style={{ paddingVertical: 5, paddingHorizontal: 10 }}>
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
                    me?.id !== comment.creator.id
                      ? COLORS.darkGray
                      : COLORS.primary,
                },
              ]}
            >
              Edit comment
            </Text>

            <MaterialCommunityIcons
              name="file-edit-outline"
              size={24}
              color={
                me?.id !== comment.creator.id ? COLORS.darkGray : COLORS.primary
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
            // disabled={deleting}
            // onPress={deleteTweet}
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
            // disabled={deleting}
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
        <Image
          source={{
            uri: Image.resolveAssetSource(profile).uri,
          }}
          style={{
            width: 30,
            height: 30,
            resizeMode: "contain",
            marginRight: 5,
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
              {comment.creator.id === me?.id
                ? "you"
                : `@${comment.creator.nickname}`}{" "}
            </Text>
            {comment.creator.verified ? (
              <MaterialIcons name="verified" size={18} color={COLORS.primary} />
            ) : null}
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 16 }}>
              {" "}
              •
            </Text>
            <Text style={[styles.p, { fontSize: 18 }]}>
              {" "}
              {dayjs(comment.createdAt).fromNow()}
            </Text>
          </View>

          <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 14 }]}>
            {comment.creator.email}
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
      <Text style={[styles.p, { fontSize: 18, marginVertical: 5 }]}>
        {comment.text}
      </Text>
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
            name="reply-outline"
            size={24}
            color={COLORS.darkGray}
          />

          <Text
            style={[
              styles.h1,
              { fontSize: 18, color: COLORS.darkGray, marginLeft: 10 },
            ]}
          >
            {comment.replies.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {}}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <MaterialIcons
            name={form.liked ? "favorite" : "favorite-border"}
            size={20}
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
            size={20}
            color={COLORS.darkGray}
          />
          <Text
            style={[
              styles.h1,
              { fontSize: 14, color: COLORS.darkGray, marginLeft: 10 },
            ]}
          >
            {new Set(comment.replies.map((r) => r.creator.id)).size}
          </Text>
        </View>
      </View>

      {comment.replies.map((reply, i) => (
        <Reply key={i} reply={reply} />
      ))}
    </View>
  );
};

export default Comment;
