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
import { useMediaQuery } from "../../../hooks";
import { COLORS } from "../../../constants";
import { MaterialIcons } from "@expo/vector-icons";

const Feed: React.FunctionComponent<AppNavProps<"Feed">> = ({ navigation }) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: ({}) => <FeedHeader navigation={navigation} />,
    });
  }, [navigation]);

  const {
    dimension: { width, height },
  } = useMediaQuery();
  const zIndex = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

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
            top: height * 0.75,
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
      ></ScrollView>
    </View>
  );
};

export default Feed;
