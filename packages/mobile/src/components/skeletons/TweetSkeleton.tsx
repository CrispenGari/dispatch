import { View, Text } from "react-native";
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
            width: 50,
            height: 50,
            backgroundColor: COLORS.loaderGray,
            marginRight: 5,
            borderRadius: 50,
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
                  height: 15,
                  backgroundColor: COLORS.loaderGray,
                  borderRadius: 999,
                  marginBottom: 3,
                }}
              />
              <ContentLoader
                style={{
                  width: "50%",
                  height: 15,
                  backgroundColor: COLORS.loaderGray,
                  borderRadius: 999,
                  marginBottom: 3,
                }}
              />
            </View>
            <ContentLoader
              style={{
                width: 10,
                height: 30,
                backgroundColor: COLORS.loaderGray,
                marginLeft: 5,
                borderRadius: 999,
              }}
            />
          </View>
          <ContentLoader
            style={{
              width: 100,
              height: 10,
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
                borderRadius: 5,
                marginRight: 5,
                backgroundColor: COLORS.loaderGray,
                marginTop: 5,
              }}
            />
          ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginTop: 5,
        }}
      >
        <ContentLoader
          style={{
            width: 50,
            height: 40,
            marginRight: 5,
            backgroundColor: COLORS.loaderGray,
            flex: 1,
            borderRadius: 5,
          }}
        />
        <ContentLoader
          style={{
            width: 80,
            height: 30,
            backgroundColor: COLORS.loaderGray,
            borderRadius: 5,
          }}
        />
      </View>
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
            <ContentLoader
              style={{
                width: 80,
                height: 20,
                backgroundColor: COLORS.loaderGray,
                marginRight: 5,
                borderRadius: 999,
              }}
            />
          ))}
      </View>
    </View>
  );
};

export default TweetSkeleton;
