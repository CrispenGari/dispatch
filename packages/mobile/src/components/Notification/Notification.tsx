import { View, Text, TouchableOpacity, Image } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { trpc } from "../../utils/trpc";
import { COLORS, profile, relativeTimeObject } from "../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { onImpact } from "../../utils";
import { styles } from "../../styles";
import { useMeStore, useSettingsStore } from "../../store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
  id: string;
  from: keyof AppParamList;
}
const Notification: React.FunctionComponent<Props> = ({ id, navigation }) => {
  const {
    data: notification,
    isLoading: loading,
    refetch,
  } = trpc.notification.notification.useQuery({ id });
  const { mutateAsync: mutateDeleteNotification, isLoading: deleting } =
    trpc.notification.del.useMutation();
  const { mutateAsync: mutateReadNotification, isLoading: reading } =
    trpc.notification.read.useMutation();
  const { mutateAsync: mutateUnReadNotification, isLoading: unreading } =
    trpc.notification.unread.useMutation();
  const swipeableRef = React.useRef<Swipeable | undefined>();
  const { settings } = useSettingsStore();
  const { me } = useMeStore();
  trpc.notification.onRead.useSubscription(
    { id: notification?.id || "", uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  const open = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!notification || reading || deleting || unreading) return;
    mutateReadNotification({ id: notification.id }).then(async (_res) => {
      await refetch();
      navigation.navigate("Tweet", {
        id: notification.tweetId,
        from: "Notifications",
      });
    });
  };
  const readNotification = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!notification || reading || deleting || unreading) return;
    mutateReadNotification({ id: notification.id }).then(async (_res) => {
      await refetch();
    });
  };
  const unReadNotification = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!notification || reading || deleting || unreading) return;
    mutateUnReadNotification({ id: notification.id }).then(async () => {
      await refetch();
    });
  };
  const deleteNotification = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!notification || reading || deleting || unreading) return;
    mutateDeleteNotification({ id: notification.id });
  };

  if (!!!notification || loading) return null;

  return (
    <Swipeable
      ref={swipeableRef as any}
      renderRightActions={(_progress, _dragX) => {
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                justifyContent: "center",
                alignItems: "center",
                minWidth: 50,
                backgroundColor: COLORS.red,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                height: "100%",
              }}
              onPress={deleteNotification}
            >
              <MaterialIcons name="delete" size={24} color={COLORS.white} />
            </TouchableOpacity>
            {notification.read ? (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 50,
                  backgroundColor: COLORS.tertiary,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  height: "100%",
                }}
                onPress={unReadNotification}
              >
                <MaterialIcons
                  name="mark-email-unread"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 50,
                  backgroundColor: COLORS.tertiary,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  height: "100%",
                }}
                onPress={readNotification}
              >
                <MaterialIcons
                  name="mark-email-read"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          flex: 1,
          paddingHorizontal: 10,
        }}
        activeOpacity={0.7}
        onPress={open}
      >
        <View style={{ position: "relative" }}>
          {!notification.read ? (
            <View
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                zIndex: 1,
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: COLORS.tertiary,
              }}
            />
          ) : null}
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
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.h1, { fontSize: 16 }]}>
              {notification.title} •
            </Text>
            <Text style={[styles.p, { fontSize: 16 }]}>
              {" "}
              {dayjs(notification.createdAt).fromNow()}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.p, { fontSize: 14, color: COLORS.darkGray }]}
          >
            {notification.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};
export default Notification;
