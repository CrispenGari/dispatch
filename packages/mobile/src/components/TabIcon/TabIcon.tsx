import React from "react";
import { View, Image, Text } from "react-native";
import { COLORS } from "../../constants";
import { useMediaQuery } from "../../hooks";
interface IconI {
  IconComponent: any;
  name: string;
}
interface Props {
  title?: string;
  Icon: IconI;
  focused: boolean;
}
const TabIcon: React.FC<Props> = ({ focused, Icon, title }) => {
  const {
    dimension: { width },
  } = useMediaQuery();
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          width: width >= 600 ? 300 : 100,
        },
      ]}
    >
      <Icon.IconComponent
        name={Icon.name}
        size={20}
        color={focused ? COLORS.green : COLORS.black}
      />
      <Text style={{ color: focused ? COLORS.green : COLORS.black }}>
        {title}
      </Text>
    </View>
  );
};

export default TabIcon;
