import { View } from "react-native";
import React from "react";
import { COLORS } from "../../constants";
import ContentLoader from "../ContentLoader/ContentLoader";

const UserSkeleton = () => {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 500,
        padding: 5,
        marginBottom: 1,
        borderBottomColor: COLORS.tertiary,
        borderBottomWidth: 0.5,
        paddingTop: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <ContentLoader
          style={{
            width: 40,
            height: 40,
            backgroundColor: COLORS.loaderGray,
            marginRight: 5,
            borderRadius: 40,
          }}
        />
        <View style={{ flex: 1 }}>
          <ContentLoader
            style={{
              width: "100%",
              height: 10,
              backgroundColor: COLORS.loaderGray,
              borderRadius: 999,
              marginBottom: 3,
            }}
          />
          <ContentLoader
            style={{
              width: "50%",
              height: 10,
              backgroundColor: COLORS.loaderGray,
              borderRadius: 999,
              marginBottom: 3,
            }}
          />
          <ContentLoader
            style={{
              width: 100,
              height: 5,
              marginRight: 5,
              borderRadius: 999,
              backgroundColor: COLORS.loaderGray,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default UserSkeleton;
