import {
  RefreshControl,
  ScrollView,
  View,
  Text,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import Ripple from "../ProgressIndicators/Ripple";
import NotificationSkeleton from "../skeletons/NotificationSkeleton";
import { COLORS } from "../../constants";
import type { AppParamList } from "../../params";
import { useSettingsStore, useMeStore } from "../../store";
import { styles } from "../../styles";
import { trpc } from "../../utils/trpc";
import Notification from "../Notification/Notification";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
}
const All: React.FunctionComponent<Props> = ({ navigation }) => {
  const { settings } = useSettingsStore();
  const [end, setEnd] = React.useState(false);
  const { me } = useMeStore();
  const [notifications, setNotifications] = React.useState<
    {
      id: string;
    }[]
  >([]);
  const {
    data,
    refetch,
    isLoading: loading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching: fetching,
  } = trpc.notification.notifications.useInfiniteQuery(
    {
      category: "general",
      limit: settings.pageLimit,
    },
    { keepPreviousData: true, getNextPageParam: ({ nextCursor }) => nextCursor }
  );

  React.useEffect(() => {
    if (!!data?.pages) {
      setNotifications(data.pages.flatMap((page) => page.notifications));
    }
  }, [data]);

  trpc.notification.onDelete.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  trpc.notification.onNotificationRead.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );

  const onScroll = async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    const paddingToBottom = 10;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const close =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setEnd(close);
    if (close && hasNextPage) {
      await fetchNextPage();
    }
  };
  if (notifications.length === 0)
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={[styles.h1, { fontSize: 18 }]}>No notifications.</Text>
      </View>
    );
  if (loading)
    return (
      <ScrollView>
        {Array(10).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </ScrollView>
    );
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
      onScroll={onScroll}
      refreshControl={
        <RefreshControl
          shouldRasterizeIOS={true}
          refreshing={fetching || loading}
          onRefresh={async () => {
            await refetch();
          }}
        />
      }
    >
      {notifications?.map(({ id }) => (
        <Notification
          navigation={navigation}
          id={id}
          key={id}
          from="Notifications"
        />
      ))}

      {isFetchingNextPage && end ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Ripple color={COLORS.tertiary} size={10} />
        </View>
      ) : null}
      {!hasNextPage ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 18 }]}>
            End of notifications.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default All;
