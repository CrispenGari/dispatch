import { View } from "react-native";
import React from "react";
import { COLORS } from "../../constants";
import { styles } from "../../styles";
import TypeWriter from "react-native-typewriter";

interface Props {
  error: boolean;
  message: string;
  type?: "primary" | "secondary";
}
const Message: React.FunctionComponent<Props> = ({ error, message, type }) => {
  return (
    <View
      style={{
        backgroundColor: error
          ? COLORS.red
          : type === "primary"
          ? COLORS.primary
          : type === COLORS.secondary
          ? COLORS.secondary
          : COLORS.tertiary,
        padding: 10,
        marginVertical: 5,
        width: "100%",
        shadowOffset: { height: 2, width: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowColor: COLORS.main,
      }}
    >
      <TypeWriter
        style={[styles.p, { color: error ? "white" : "black" }]}
        typing={1}
        maxDelay={-50}
      >
        {message}
      </TypeWriter>
    </View>
  );
};

export default Message;
