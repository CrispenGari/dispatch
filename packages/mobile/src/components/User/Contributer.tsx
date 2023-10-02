import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import type { User } from "@dispatch/api";
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

const Contributor: React.FunctionComponent<{
  onPress: () => void;
  contributor: User;
}> = ({ onPress, contributor }) => {
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
            {contributor.id === me?.id ? "you" : `@${contributor.nickname}`}{" "}
          </Text>
          {contributor.verified ? (
            <MaterialIcons name="verified" size={14} color={COLORS.primary} />
          ) : null}
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}> •</Text>
          <Text style={[styles.p, { fontSize: 16 }]}>
            {" "}
            {dayjs(contributor.createdAt).fromNow()}
          </Text>
        </View>
        <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
          {contributor.email}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Contributor;
