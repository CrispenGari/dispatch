import { View, Text, Image } from "react-native";
import React from "react";
import { COLORS, FONTS, profile, relativeTimeObject } from "../../constants";
import { Poll as P, Reaction, Tweet as T, User, Comment } from "@dispatch/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { styles } from "../../styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomSheet } from "react-native-btr";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useMediaQuery } from "../../hooks";
dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  tweet: T & {
    creator: User;
    reactions: Reaction[];
    polls: P[];
    comments: Partial<Comment> &
      {
        creator: User;
        reactions: Reaction[];
        replies: Partial<Comment> & { creator: User; reactions: Reaction[] }[];
      }[];
  };
}

const Tweet: React.FunctionComponent<Props> = ({ tweet }) => {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((state) => !state);
  const {
    dimension: { height },
  } = useMediaQuery();
  return (
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
            height: height / 2,
            backgroundColor: COLORS.main,
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
          }}
        ></View>
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
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 20 }}>
              @{tweet.creator.nickname}{" "}
            </Text>
            {tweet.creator.verified ? (
              <MaterialIcons name="verified" size={18} color={COLORS.primary} />
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
          <Poll key={poll.id} poll={poll} />
        ))}
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
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <MaterialIcons name="favorite" size={24} color={COLORS.primary} />
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
  );
};

export default Tweet;

const Poll: React.FunctionComponent<{
  poll: P;
}> = ({ poll }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: COLORS.main,
        borderWidth: 3,
        borderColor: COLORS.gray,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 3,
        width: "100%",
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.h1, { fontSize: 18, zIndex: 1, overflow: "visible" }]}
      >
        {poll.text}
      </Text>
    </TouchableOpacity>
  );
};
