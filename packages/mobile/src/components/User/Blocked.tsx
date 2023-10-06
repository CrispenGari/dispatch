import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import dayjs from "dayjs";
import {
  APP_NAME,
  COLORS,
  FONTS,
  profile,
  relativeTimeObject,
} from "../../constants";
import type { Blocked } from "@dispatch/api";
import { styles } from "../../styles";
import { useMeStore, useSettingsStore } from "../../store";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { trpc } from "../../utils/trpc";
import { onImpact } from "../../utils";
import UserSkeleton from "../skeletons/UserSkeleton";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);
dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

const BlockedUser: React.FunctionComponent<{
  blocked: Blocked;
}> = ({ blocked }) => {
  const swipeableRef = React.useRef<Swipeable | undefined>();
  const { mutateAsync: mutateUnBlockUser, isLoading: unblocking } =
    trpc.blocked.unblock.useMutation();

  const { data: user, isFetching: fetching } = trpc.user.user.useQuery({
    id: blocked.uid,
  });
  const { settings } = useSettingsStore();

  const { me } = useMeStore();
  const unBlock = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!user || fetching) return;
    Alert.alert(
      APP_NAME,
      `Are you sure you want to unblock ${user.nickname}.`,
      [
        {
          style: "default",
          text: "OK",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            mutateUnBlockUser({ uid: user.id }).then(() => {});
          },
        },
        {
          style: "cancel",
          text: "CANCEL",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!!!user || fetching) return <UserSkeleton />;
  return (
    <Swipeable
      ref={swipeableRef as any}
      renderRightActions={(_progress, _dragX) => {
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={unblocking}
              style={{
                justifyContent: "center",
                alignItems: "center",
                minWidth: 50,
                backgroundColor: COLORS.tertiary,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                height: "100%",
              }}
              onPress={unBlock}
            >
              <MaterialCommunityIcons
                name="hand-back-left-off-outline"
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        );
      }}
    >
      <TouchableOpacity
        onPress={unBlock}
        disabled={unblocking}
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
              {user.id === me?.id ? "you" : `@${user.nickname}`}{" "}
            </Text>
            {user.verified ? (
              <MaterialIcons name="verified" size={14} color={COLORS.primary} />
            ) : null}
            <Text style={{ fontFamily: FONTS.extraBold, fontSize: 14 }}>
              {" "}
              •
            </Text>
            <Text style={[styles.p, { fontSize: 16 }]}>
              {" "}
              {dayjs(user.createdAt).fromNow()}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
              {user.email}
            </Text>
            <Text style={[styles.p, { color: COLORS.darkGray, fontSize: 12 }]}>
              {" • blocked "}
              {dayjs(blocked.createdAt).fromNow()} ago
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default BlockedUser;
