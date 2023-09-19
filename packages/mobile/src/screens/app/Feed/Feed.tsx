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
import { styles } from "../../../styles";
import { useMediaQuery, usePlatform } from "../../../hooks";
import { COLORS, KEYS } from "../../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { trpc } from "../../../utils/trpc";
import { del } from "../../../utils";
import { useMeStore } from "../../../store";

const Feed: React.FunctionComponent<AppNavProps<"Feed">> = ({ navigation }) => {
  const { mutateAsync } = trpc.auth.logout.useMutation();
  const { data: tweets } = trpc.tweet.tweets.useQuery();
  const { setMe } = useMeStore();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: ({}) => <FeedHeader navigation={navigation} />,
    });
  }, [navigation]);
  const { os } = usePlatform();
  const {
    dimension: { height },
  } = useMediaQuery();
  const zIndex = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;
  const logout = () => {
    mutateAsync().then(async (res) => {
      if (res) {
        await del(KEYS.TOKEN_KEY);
        setMe(null);
      }
    });
  };
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
      >
        <Text>{JSON.stringify({ tweets }, null, 2)}</Text>
      </ScrollView>
    </View>
  );
};

export default Feed;
