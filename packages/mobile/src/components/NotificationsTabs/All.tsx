import { RefreshControl, ScrollView, View, Text } from "react-native";
import React from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { COLORS } from "../../constants";

import { trpc } from "../../utils/trpc";
import Notification from "../Notification/Notification";
import NotificationSkeleton from "../skeletons/NotificationSkeleton";
import { useMeStore } from "../../store";
import { styles } from "../../styles";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Notifications">;
}
const All: React.FunctionComponent<Props> = ({ navigation }) => {
  const {
    data: notifications,
    isFetching: fetching,
    refetch,
  } = trpc.notification.notifications.useQuery({
    category: "general",
  });
  const { me } = useMeStore();
  trpc.notification.onDelete.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  if (!!!notifications?.length)
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
  if (fetching && notifications?.length === 0)
    return (
      <>
        {Array(10).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </>
    );
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          shouldRasterizeIOS={true}
          refreshing={fetching}
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
    </ScrollView>
  );
};

export default All;
