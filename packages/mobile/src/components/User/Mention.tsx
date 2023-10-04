import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import type { User } from "@dispatch/api";
import { COLORS, FONTS, profile, relativeTimeObject } from "../../constants";
import { styles } from "../../styles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { MaterialIcons } from "@expo/vector-icons";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

const Mention: React.FunctionComponent<{
  onPress: () => void;
  mention: User;
}> = ({ onPress, mention }) => {
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
          width: 30,
          height: 30,
          resizeMode: "contain",
          marginRight: 5,
          borderRadius: 30,
        }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
            {`@${mention.nickname}`}{" "}
          </Text>
          {mention.verified ? (
            <MaterialIcons name="verified" size={14} color={COLORS.primary} />
          ) : null}
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}> •</Text>
          <Text style={[styles.p, { fontSize: 16 }]}>
            {" "}
            {dayjs(mention.createdAt).fromNow()}
          </Text>
        </View>
        <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
          {mention.email}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Mention;
