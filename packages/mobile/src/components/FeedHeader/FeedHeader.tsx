import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Image,
} from "react-native";
import React from "react";
import { COLORS, profile } from "../../constants";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import type { AppParamList } from "../../params";
import {
  useMeStore,
  useNetworkStore,
  useSettingsStore,
  useTriggersStore,
} from "../../store";
import { onImpact } from "../../utils";
import { trpc } from "../../utils/trpc";
import { styles } from "../../styles";
interface Props {
  navigation: StackNavigationProp<AppParamList, "Feed">;
}
const FeedHeader: React.FunctionComponent<Props> = ({ navigation }) => {
  const { me } = useMeStore();
  const { settings } = useSettingsStore();

  const { network } = useNetworkStore();
  const { trigger, setTrigger } = useTriggersStore();
  const { data: notifications, refetch } = trpc.notification.all.useQuery();
  trpc.notification.onDelete.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        setTrigger({
          ...trigger,
          notification: {
            delete: true,
            read: false,
          },
        });
        await refetch();
      },
    }
  );
  trpc.notification.onNotificationRead.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        setTrigger({
          ...trigger,
          notification: {
            delete: false,
            read: true,
          },
        });
        await refetch();
      },
    }
  );

  trpc.reaction.onNewReactionNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.comment.onNewCommentNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );

  trpc.tweet.onNewTweetNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.tweet.onTweetMention.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.poll.onVoteNotification.useSubscription(
    {
      uid: me?.id || "",
    },
    {
      onData: async (data: any) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  const [headerState, setHeaderState] = React.useState({
    searchTerm: "",
    focused: false,
    notification: false,
    status: "offline" as "online" | "connected" | "offline",
  });

  React.useEffect(() => {
    if (network.isConnected && network.isInternetReachable) {
      setHeaderState((state) => ({ ...state, status: "online" }));
    } else if (network.isConnected && !network.isInternetReachable) {
      setHeaderState((state) => ({ ...state, status: "connected" }));
    } else {
      setHeaderState((state) => ({ ...state, status: "offline" }));
    }
  }, [network]);

  React.useEffect(() => {
    if (!!notifications) {
      setHeaderState((state) => ({
        ...state,
        notification: !!notifications.filter(({ read }) => read === false)
          .length,
      }));
    }
  }, [notifications]);

  return (
    <View
      style={{
        backgroundColor: COLORS.main,
        paddingTop: 25,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.primary,
      }}
    >
      <SafeAreaView
        style={{ flexDirection: "row", justifyContent: "space-between" }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ marginLeft: 10 }}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("User", { id: me?.id ?? "", from: "Feed" });
          }}
        >
          <Image
            style={{
              width: 40,
              height: 40,
              resizeMode: "contain",
              borderRadius: 40,
            }}
            source={{ uri: Image.resolveAssetSource(profile).uri }}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                navigation.navigate("Notifications");
              }}
              style={{
                position: "relative",
                marginHorizontal: 10,
              }}
            >
              {headerState.notification ? (
                <View
                  style={{
                    backgroundColor: COLORS.tertiary,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    position: "absolute",
                    zIndex: 1,
                    top: 0,
                    left: 0,
                  }}
                />
              ) : null}
              <Ionicons
                name="ios-notifications-outline"
                size={26}
                color={COLORS.black}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                navigation.navigate("Settings");
              }}
              activeOpacity={0.7}
              style={{ marginHorizontal: 10 }}
            >
              <Ionicons
                name="md-settings-outline"
                size={26}
                color={COLORS.black}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            paddingVertical: 5,
            paddingHorizontal: 20,
            shadowRadius: 2,
            shadowOffset: { width: 2, height: 2 },
            shadowColor: COLORS.white,
            borderWidth: 0.5,
            borderRadius: 999,
            shadowOpacity: 1,
            elevation: 1,
            backgroundColor: COLORS.main,
            borderColor: COLORS.primary,
          }}
        >
          <Text
            style={[
              styles.h1,
              {
                color:
                  headerState.status === "online"
                    ? COLORS.primary
                    : headerState.status === "offline"
                    ? COLORS.red
                    : COLORS.black,
              },
            ]}
          >
            {headerState.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FeedHeader;
