import {
  TouchableOpacity,
  ScrollView,
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  Text,
  RefreshControl,
} from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import FeedHeader from "../../../components/FeedHeader/FeedHeader";
import { useMediaQuery, usePlatform } from "../../../hooks";
import { COLORS, FONTS } from "../../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { trpc } from "../../../utils/trpc";
import * as Location from "expo-location";
import { useLocationStore, useMeStore, useSettingsStore } from "../../../store";
import Tweet from "../../../components/Tweet/Tweet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onImpact } from "../../../utils";
import TweetSkeleton from "../../../components/skeletons/TweetSkeleton";

const Feed: React.FunctionComponent<AppNavProps<"Feed">> = ({ navigation }) => {
  const {
    data: tweets,
    refetch,
    isLoading: loading,
    isFetching: fetching,
  } = trpc.tweet.tweets.useQuery();
  const { data: me, isFetching: getting } = trpc.user.me.useQuery();
  const { os } = usePlatform();
  const { settings } = useSettingsStore();
  const {
    dimension: { height },
  } = useMediaQuery();
  const zIndex = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;
  const { setMe } = useMeStore();
  const { location } = useLocationStore();
  const [address, setAddress] = React.useState<
    Location.LocationGeocodedAddress | undefined
  >();

  // feed listiners
  trpc.tweet.onNewTweet.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.tweet.onDeleteTweet.useSubscription(
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
    if (location) {
      Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }).then((data) => {
        setAddress(data[0]);
      });
    }
  }, [location]);
  const onMomentumScrollBegin = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    e.persist();
    Animated.sequence([
      Animated.timing(zIndex, {
        duration: 0,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 0,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    e.persist();
    Animated.sequence([
      Animated.timing(zIndex, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: ({}) => <FeedHeader navigation={navigation} />,
    });
  }, [navigation]);
  React.useEffect(() => {
    if (!!me) {
      setMe(me);
    } else {
      setMe(null);
    }
  }, [me]);

  return (
    <View
      style={{ backgroundColor: COLORS.main, flex: 1, position: "relative" }}
    >
      <Animated.View
        style={{
          zIndex,
          position: "absolute",
          opacity,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("Create");
          }}
          style={{
            top: os === "android" ? height * 0.8 : height * 0.75,
            left: 30,
            backgroundColor: COLORS.primary,
            justifyContent: "center",
            alignItems: "center",
            width: 40,
            height: 40,
            borderRadius: 40,
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="create" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </Animated.View>
      <ScrollView
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ flex: 1, backgroundColor: COLORS.main }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            shouldRasterizeIOS={true}
            refreshing={fetching || loading || getting}
            onRefresh={async () => {
              await refetch();
            }}
          />
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            padding: 10,
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontFamily: FONTS.extraBold, fontSize: 25, flex: 1 }}>
            What's Happening in {address ? address.city : "the City"}?
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 2,
              borderRadius: 50,
            }}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {!!tweets
          ? tweets.tweets.map((tweet) => (
              <Tweet
                navigation={navigation}
                tweet={tweet}
                key={tweet.id}
                from="Feed"
              />
            ))
          : Array(10).map((_, i) => <TweetSkeleton key={i} />)}
      </ScrollView>
    </View>
  );
};

export default Feed;
