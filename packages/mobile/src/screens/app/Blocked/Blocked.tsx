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
import { useSettingsStore } from "../../../store";
import { usePlatform } from "../../../hooks";
import { trpc } from "../../../utils/trpc";
import type { User } from "@dispatch/api";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { styles } from "../../../styles";

const Blocked: React.FunctionComponent<AppNavProps<"Blocked">> = ({
  navigation,
  route,
}) => {
  const { settings } = useSettingsStore();
  const { os } = usePlatform();
  const [end, setEnd] = React.useState(false);
  const [blocked, setBlocked] = React.useState<User[]>([]);
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
  React.useEffect(() => {
    if (!!data?.pages) {
      setBlocked(data.pages.flatMap((page) => page.blocked.map((b) => b.user)));
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
      <Text>{JSON.stringify(blocked, null, 2)}</Text>
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
          <Text style={[styles.h1, { textAlign: "center", fontSize: 18 }]}>
            End of blocked users.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Blocked;
