import { View, Text, ScrollView } from "react-native";
import React from "react";
import { AppNavProps } from "../../../params";
import { COLORS, FONTS } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";

const Tweet: React.FunctionComponent<AppNavProps<"Tweet">> = ({
  navigation,
}) => {
  const { os } = usePlatform();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "View Tweet",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0.5,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? "Feed" : ""}
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  //   if (fetching) return <Text>Fetching...</Text>;
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.main,
      }}
    >
      <Text>Tweet</Text>
    </ScrollView>
  );
};

export default Tweet;
