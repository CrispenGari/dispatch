import { View, Text, FlatList } from "react-native";
import React from "react";
import type { User } from "@dispatch/api";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { BottomSheet } from "react-native-btr";
import { COLORS, relativeTimeObject } from "../../constants";

import { useSettingsStore } from "../../store";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { onImpact } from "../../utils";
import dayjs from "dayjs";
import { styles } from "../../styles";
import { useMediaQuery } from "../../hooks";
import Contributor from "../User/Contributer";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  contributors: User[];
  open: boolean;
  toggle: () => void;
  from: keyof AppParamList;
  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
}
const ReplyContributors: React.FunctionComponent<Props> = ({
  navigation,
  from,
  contributors,
  toggle,
  open,
}) => {
  const { settings } = useSettingsStore();
  const {
    dimension: { height },
  } = useMediaQuery();
  return (
    <BottomSheet
      visible={!!open}
      onBackButtonPress={() => {
        if (settings.haptics) {
          onImpact();
        }
        toggle();
      }}
      onBackdropPress={() => {
        if (settings.haptics) {
          onImpact();
        }
        toggle();
      }}
    >
      <View
        style={{
          height: height / 2,
          backgroundColor: COLORS.main,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            borderRadius: 999,
            padding: 5,
            alignSelf: "center",
            top: -10,
            backgroundColor: COLORS.main,
            paddingHorizontal: 15,
            shadowOffset: { height: 2, width: 2 },
            shadowOpacity: 1,
            shadowRadius: 2,
            shadowColor: COLORS.primary,
            elevation: 1,
          }}
        >
          <Text style={[styles.h1, {}]}>Comment Contributors</Text>
        </View>
        <FlatList
          data={contributors}
          keyExtractor={(contributor) => contributor.id}
          renderItem={({ item }) => (
            <Contributor
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                toggle();
                navigation.navigate("User", {
                  from,
                  id: item.id,
                });
              }}
              contributor={item}
            />
          )}
          contentContainerStyle={{ paddingTop: 15, paddingBottom: 50 }}
        />
      </View>
    </BottomSheet>
  );
};

export default ReplyContributors;
