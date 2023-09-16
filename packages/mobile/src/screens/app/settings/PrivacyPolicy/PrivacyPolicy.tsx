import { View, Text, ScrollView } from "react-native";
import React from "react";
import { COLORS } from "../../../../constants";
import { SettingsTabStacksNavProps } from "../../../../params";

const PrivacyPolicy: React.FunctionComponent<
  SettingsTabStacksNavProps<"PrivacyPolicy">
> = ({ navigation }) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Privacy Policy",
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
      <Text style={[{ marginTop: 10 }]}>
        If you have any questions or suggestions about our Privacy Policy, do
        not hesitate to contact us at crispengari@gmail.com.
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicy;
