import { View } from "react-native";
import React from "react";
import { COLORS } from "../../constants";
import ContentLoader from "../ContentLoader/ContentLoader";

const TweetSkeleton = () => {
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
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
            </View>
            <ContentLoader
              style={{
                width: 5,
                height: 20,
                backgroundColor: COLORS.loaderGray,
                marginLeft: 5,
                borderRadius: 999,
              }}
            />
          </View>
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
      <View style={{ marginVertical: 0 }}>
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <ContentLoader
              key={i}
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                backgroundColor: COLORS.loaderGray,
                marginRight: 5,
                marginTop: 5,
              }}
            />
          ))}
        <ContentLoader
          style={{
            width: "50%",
            height: 10,
            borderRadius: 999,
            backgroundColor: COLORS.loaderGray,
            marginRight: 5,
            marginTop: 5,
          }}
        />
      </View>

      <View style={{ marginVertical: 3 }}>
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <ContentLoader
              key={i}
              style={{
                width: "100%",
                height: 30,
                borderRadius: 999,
                marginRight: 5,
                backgroundColor: COLORS.loaderGray,
                marginTop: 5,
              }}
            />
          ))}
      </View>
      <ContentLoader
        style={{
          width: 80,
          height: 10,
          backgroundColor: COLORS.loaderGray,
          marginTop: 5,
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
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <ContentLoader
                style={{
                  width: 30,
                  height: 20,
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

export default TweetSkeleton;
