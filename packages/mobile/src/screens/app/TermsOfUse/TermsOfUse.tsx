import { View, Text, ScrollView } from "react-native";
import React from "react";
import { AppNavProps, AuthNavProps } from "../../../params";
import { COLORS } from "../../../constants";

const TermsOfUse: React.FunctionComponent<AppNavProps<"AppTermsOfUse">> = ({
  navigation,
}) => {
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
