import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { COLORS, FONTS } from "../../../constants";
import { onImpact } from "../../../utils";
import { useMeStore, useSettingsStore } from "../../../store";
import { usePlatform } from "../../../hooks";
import { trpc } from "../../../utils/trpc";
import type { Blocked as B } from "@dispatch/api";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { styles } from "../../../styles";
import BlockedUser from "../../../components/User/Blocked";

const Blocked: React.FunctionComponent<AppNavProps<"Blocked">> = ({
  navigation,
  route,
}) => {
  const { settings } = useSettingsStore();
  const { os } = usePlatform();
  const [end, setEnd] = React.useState(false);
  const [blocked, setBlocked] = React.useState<B[]>([]);
  const { me } = useMeStore();
  const {
    data,
    refetch,
    isLoading: loading,
    isFetching: fetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.blocked.blocked.useInfiniteQuery(
    {
      limit: settings.pageLimit,
    },
    {
      keepPreviousData: true,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  );

  trpc.blocked.onUserUnBlock.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );

  trpc.blocked.onUserBlock.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  React.useEffect(() => {
    if (!!data?.pages) {
      setBlocked(data.pages.flatMap((page) => page.blocked));
    }
  }, [data]);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Blocked Users",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0.5,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? route.params.from : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, settings, route]);

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

  if (fetching)
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 30,
        }}
      >
        <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
          Loading ...
        </Text>
      </View>
    );
  if (blocked.length === 0)
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={[styles.h1, { fontSize: 14 }]}>No blocked users.</Text>
      </View>
    );
  return (
    <ScrollView
      onScroll={onScroll}
      style={{ flex: 1, backgroundColor: COLORS.main }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100 }}
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
      {blocked.map((blocked) => (
        <BlockedUser key={blocked.id} blocked={blocked} />
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

      {!hasNextPage && blocked.length > 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
        >
          <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
            End of blocked users.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Blocked;
