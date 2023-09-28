import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, KEYS, profile, relativeTimeObject } from "../../constants";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { useMeStore, useSettingsStore } from "../../store";
import { styles } from "../../styles";
import dayjs from "dayjs";
import { MaterialIcons } from "@expo/vector-icons";
import Ripple from "../ProgressIndicators/Ripple";
import { trpc } from "../../utils/trpc";
import { del, onImpact } from "../../utils";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});
const Profile = () => {
  const { me, setMe } = useMeStore();
  const { mutateAsync: mutateLogout, isLoading } =
    trpc.auth.logout.useMutation();
  const { settings } = useSettingsStore();
  const logout = () => {
    if (settings.haptics) {
      onImpact();
    }
    mutateLogout().then(async (res) => {
      if (res) {
        const res = await del(KEYS.TOKEN_KEY);
        if (res) {
          setMe(null);
        }
      }
    });
  };
  if (!!!me) return null;
  return (
    <View
      style={{
        justifyContent: "center",
        maxWidth: 500,
        padding: 10,
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 5,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 16 }]}>
            @{me.nickname}
          </Text>
          {me.verified ? (
            <MaterialIcons name="verified" size={14} color={COLORS.primary} />
          ) : null}
        </View>

        <Text
          style={[
            styles.p,
            {
              textAlign: "center",
              marginBottom: 5,
              fontSize: 14,
              color: COLORS.darkGray,
            },
          ]}
        >
          {me.email} • {me.gender.toLowerCase()} • created{" "}
          {dayjs(me.createdAt).fromNow()}
        </Text>
      </View>
      <Image
        source={{
          uri: Image.resolveAssetSource(profile).uri,
        }}
        style={{
          width: 70,
          height: 70,
          resizeMode: "contain",
          marginRight: 5,
          borderRadius: 70,
        }}
      />

      <Text
        style={[
          styles.p,
          { textAlign: "center", marginVertical: 5, fontSize: 16 },
        ]}
      >
        {me.bio}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={logout}
        disabled={isLoading}
        style={[
          styles.button,
          {
            backgroundColor: COLORS.primary,
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            maxWidth: 130,
          },
        ]}
      >
        <Text
          style={[
            styles.button__text,
            {
              marginRight: isLoading ? 10 : 0,
              fontSize: 16,
            },
          ]}
        >
          LOGOUT
        </Text>
        {isLoading ? <Ripple color={COLORS.tertiary} size={5} /> : null}
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
