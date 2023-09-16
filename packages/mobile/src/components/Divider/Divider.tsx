import { View, Text } from "react-native";
import React from "react";
import { styles } from "../../styles";
import { COLORS } from "../../constants";

interface Props {
  title: string;
  color: string;
}
const Divider: React.FunctionComponent<Props> = ({ title, color }) => {
  return (
    <View
      style={{
        marginVertical: 10,
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={[styles.h1, { color }]}>{title}</Text>
      <View
        style={{
          borderBottomColor: color,
          flex: 1,
          borderBottomWidth: 0.5,
          marginLeft: 10,
        }}
      />
    </View>
  );
};

export default Divider;
