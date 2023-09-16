import { View, Text, ScrollView } from "react-native";
import React from "react";
import { COLORS } from "../../../../constants";
import { SettingsTabStacksNavProps } from "../../../../params";

const TermsOfUse: React.FunctionComponent<
  SettingsTabStacksNavProps<"TermsOfUse">
> = ({ navigation }) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Terms of Use",
    });
  }, [navigation]);
  return (
    <ScrollView
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 10,
        paddingTop: 10,
      }}
      style={{ backgroundColor: COLORS.main, flex: 1 }}
    >
      <Text>Terms of use</Text>
    </ScrollView>
  );
};

export default TermsOfUse;
