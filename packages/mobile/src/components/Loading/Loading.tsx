import { View, Image } from "react-native";
import React from "react";
import { COLORS, logo } from "../../constants";
import Indeterminate from "../ProgressIndicators/Indeterminate";
import * as Animatable from "react-native-animatable";
const Loading = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animatable.View
        iterationCount={1}
        iterationDelay={500}
        animation={"zoomIn"}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Image
          style={{
            width: 100,
            height: 100,
            resizeMode: "contain",
            marginBottom: -30,
          }}
          source={{ uri: Image.resolveAssetSource(logo).uri }}
        />
        <Indeterminate width={85} color={COLORS.primary} />
      </Animatable.View>
    </View>
  );
};

export default Loading;
