import {
  TouchableOpacity,
  ScrollView,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  Text,
} from "react-native";
import React from "react";
import { AppNavProps } from "../../../params";
import FeedHeader from "../../../components/FeedHeader/FeedHeader";
import { useMediaQuery, usePlatform } from "../../../hooks";
import { COLORS, FONTS, KEYS } from "../../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { trpc } from "../../../utils/trpc";
import * as Location from "expo-location";
import { useLocationStore, useMeStore } from "../../../store";
import Tweet from "../../../components/Tweet/Tweet";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Feed: React.FunctionComponent<AppNavProps<"Feed">> = ({ navigation }) => {
  const { data: tweets, refetch } = trpc.tweet.tweets.useQuery();
  const { os } = usePlatform();
  const {
    dimension: { height },
  } = useMediaQuery();
  const zIndex = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;
  const { me } = useMeStore();
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
  trpc.tweet.onTweetUpdate.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.comment.onTweetComment.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );
  trpc.reaction.onTweetReaction.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (data) => {
        if (!!data) {
          await refetch();
        }
      },
    }
  );

  trpc.tweet.onView.useSubscription(
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
            navigation.navigate("Create");
          }}
          style={{
            top: os === "android" ? height * 0.75 : height * 0.7,
            left: 30,
            backgroundColor: COLORS.primary,
            justifyContent: "center",
            alignItems: "center",
            width: 50,
            height: 50,
            borderRadius: 50,
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="create" size={30} color={COLORS.secondary} />
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
        {!!tweets ? (
          tweets.tweets.map((tweet) => (
            <Tweet navigation={navigation} tweet={tweet} key={tweet.id} />
          ))
        ) : (
          <Text>No Tweets</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Feed;
