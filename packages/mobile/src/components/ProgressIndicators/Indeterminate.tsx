import { View, Animated } from "react-native";
import React from "react";
import { COLORS } from "../../constants";

interface Props {
  width: number;
  color: string;
}
const Indeterminate: React.FunctionComponent<Props> = ({ width, color }) => {
  const indicatorAnimation = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(indicatorAnimation, {
        toValue: 1,
        delay: 0,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const translateX = indicatorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });
  return (
    <View
      style={{
        width,
        flexDirection: "column",
        backgroundColor: COLORS.gray,
        borderRadius: 999,
        paddingVertical: 2,
        paddingHorizontal: 10,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          backgroundColor: color,
          width: "30%",
          height: 4,
          transform: [{ translateX }],
          position: "absolute",
          borderRadius: 10,
        }}
      />
    </View>
  );
};

export default Indeterminate;
