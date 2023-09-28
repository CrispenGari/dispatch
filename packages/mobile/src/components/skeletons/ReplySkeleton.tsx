import { View } from "react-native";
import React from "react";
import { COLORS } from "../../constants";
import ContentLoader from "../ContentLoader/ContentLoader";

const ReplySkeleton = () => {
  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: "80%",
        alignSelf: "flex-end",
      }}
    >
      <View
        style={{
          borderRightWidth: 1,
          position: "absolute",
          height: 20,
          borderColor: COLORS.tertiary,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <ContentLoader
          style={{
            width: 30,
            height: 30,
            backgroundColor: COLORS.loaderGray,
            marginRight: 3,
            borderRadius: 30,
          }}
        />
        <View style={{ flex: 1 }}>
          <ContentLoader
            style={{
              width: "70%",
              height: 10,
              backgroundColor: COLORS.loaderGray,
              borderRadius: 999,
            }}
          />
          <ContentLoader
            style={{
              width: "30%",
              height: 5,
              backgroundColor: COLORS.loaderGray,
              borderRadius: 999,
              marginTop: 3,
            }}
          />
        </View>
        <ContentLoader
          style={{
            width: 5,
            height: 15,
            backgroundColor: COLORS.loaderGray,
            marginLeft: 5,
            borderRadius: 5,
          }}
        />
      </View>
      {Array(2)
        .fill(null)
        .map((_, i) => (
          <ContentLoader
            key={i}
            style={{
              width: "100%",
              height: 5,
              backgroundColor: COLORS.loaderGray,
              marginTop: 3,
              borderRadius: 999,
            }}
          />
        ))}
      <ContentLoader
        style={{
          width: "50%",
          height: 5,
          backgroundColor: COLORS.loaderGray,
          marginTop: 3,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          marginVertical: 10,
        }}
      >
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <ContentLoader
                style={{
                  width: 30,
                  height: 15,
                  backgroundColor: COLORS.loaderGray,
                  marginRight: 3,
                  borderRadius: 5,
                }}
              />
              <ContentLoader
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: COLORS.loaderGray,
                  borderRadius: 999,
                }}
              />
            </View>
          ))}
      </View>
    </View>
  );
};

export default ReplySkeleton;
