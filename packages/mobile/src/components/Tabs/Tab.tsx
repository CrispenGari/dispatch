import { View, Text } from "react-native";
import { usePlatform } from "../../hooks";
import { styles } from "../../styles";

export const Tab: React.FunctionComponent<{
  title: "tweets" | "mentions";
}> = ({ title }) => {
  const { os } = usePlatform();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={[
          styles.h1,
          {
            fontSize: os === "ios" ? 14 : 12,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};
