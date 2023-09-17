import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { styles } from "../../styles";

const Footer = () => {
  return (
    <SafeAreaView
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          paddingHorizontal: 10,
          justifyContent: "center",
          paddingVertical: 5,
        }}
      >
        <Text style={[styles.p, { color: "black", textAlign: "center" }]}>
          Copyright © {new Date().getFullYear()} dispatch Inc. All rights
          reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Footer;
