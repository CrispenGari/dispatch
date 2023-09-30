import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import type { Reaction, User as U } from "@dispatch/api";
import dayjs from "dayjs";
import { COLORS, profile, FONTS, relativeTimeObject } from "../../constants";
import { useMeStore } from "../../store";
import { styles } from "../../styles";
import { MaterialIcons } from "@expo/vector-icons";

import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

const User: React.FunctionComponent<{
  onPress: () => void;
  reactor: Reaction & { creator: U };
}> = ({ onPress, reactor }) => {
  const { me } = useMeStore();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderBottomWidth: 0.4,
        borderBottomColor: COLORS.tertiary,
        width: "100%",
      }}
    >
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
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
            {reactor.creatorId === me?.id
              ? "you"
              : `@${reactor.creator.nickname}`}{" "}
          </Text>
          {reactor.creator.verified ? (
            <MaterialIcons name="verified" size={16} color={COLORS.primary} />
          ) : null}
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}> •</Text>
          <Text style={[styles.p, { fontSize: 16 }]}>
            {" "}
            {dayjs(reactor.createdAt).fromNow()}
          </Text>
        </View>
        <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
          {reactor.creator.email}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default User;
