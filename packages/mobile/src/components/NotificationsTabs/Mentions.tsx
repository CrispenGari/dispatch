import {
  Text,
  ScrollView,
  RefreshControl,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../constants";
import type { AppParamList } from "../../params";
import { trpc } from "../../utils/trpc";
import Notification from "../Notification/Notification";
import { useSettingsStore, useTriggersStore } from "../../store";
import { styles } from "../../styles";
import Ripple from "../ProgressIndicators/Ripple";
import NotificationSkeleton from "../skeletons/NotificationSkeleton";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
  sort: {
    id: number;
    value: "asc" | "desc" | "read" | "unread";
    name: string;
  };
}
const Mentions: React.FunctionComponent<Props> = ({ navigation, sort }) => {
  const { settings } = useSettingsStore();
  const [end, setEnd] = React.useState(false);
  const { trigger } = useTriggersStore();
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
      category: "mention",
      limit: settings.pageLimit,
      sortBy: sort.value,
    },
    { keepPreviousData: true, getNextPageParam: ({ nextCursor }) => nextCursor }
  );

  React.useEffect(() => {
    if (!!data?.pages) {
      setNotifications(data.pages.flatMap((page) => page.notifications));
    }
  }, [data]);

  React.useEffect(() => {
    if (trigger.notification?.delete) {
      refetch();
    }
  }, [trigger]);

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
  if ((fetching || loading) && notifications.length === 0)
    return (
      <ScrollView>
        {Array(10).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </ScrollView>
    );
  if (notifications.length === 0)
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={[styles.p, { fontSize: 14 }]}>No notifications.</Text>
      </View>
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
          <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
            End of notifications.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Mentions;
