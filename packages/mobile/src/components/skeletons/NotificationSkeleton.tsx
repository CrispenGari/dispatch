import { View } from "react-native";
import React from "react";
import ContentLoader from "../ContentLoader/ContentLoader";
import { COLORS } from "../../constants";

const NotificationSkeleton = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        flex: 1,
        paddingHorizontal: 10,
      }}
    >
      <ContentLoader
        style={{
          width: 43,
          height: 43,
          backgroundColor: COLORS.loaderGray,
          marginRight: 3,
          borderRadius: 43,
        }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <ContentLoader
            style={{
              height: 10,
              backgroundColor: COLORS.loaderGray,
              marginRight: 5,
              borderRadius: 999,
              flex: 1,
            }}
          />
          <ContentLoader
            style={{
              height: 10,
              backgroundColor: COLORS.loaderGray,
              marginRight: 5,
              borderRadius: 999,
              flex: 1,
              maxWidth: 20,
            }}
          />
        </View>
        <ContentLoader
          style={{
            width: "100%",
            height: 8,
            backgroundColor: COLORS.loaderGray,
            borderRadius: 999,
            marginTop: 3,
          }}
        />
        <ContentLoader
          style={{
            width: "50%",
            height: 8,
            backgroundColor: COLORS.loaderGray,
            borderRadius: 999,
            marginTop: 3,
          }}
        />
      </View>
    </View>
  );
};

export default NotificationSkeleton;
