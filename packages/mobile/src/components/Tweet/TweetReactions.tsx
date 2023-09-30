import { View, Text, FlatList } from "react-native";
import React from "react";
import type { Reaction, User } from "@dispatch/api";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";
import { BottomSheet } from "react-native-btr";
import { COLORS, relativeTimeObject } from "../../constants";
import Reactor from "../User/User";
import { useSettingsStore } from "../../store";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { onImpact } from "../../utils";
import dayjs from "dayjs";
import { styles } from "../../styles";
import { useMediaQuery } from "../../hooks";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: relativeTimeObject,
});

interface Props {
  reactions: (Reaction & { creator: User })[];
  open: boolean;
  toggle: () => void;
  from: keyof AppParamList;
  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
}
const TweetReactions: React.FunctionComponent<Props> = ({
  navigation,
  from,
  reactions,
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
          <Text style={[styles.h1, {}]}>Tweet Reactions</Text>
        </View>
        <FlatList
          data={reactions}
          keyExtractor={(reaction) => reaction.id}
          renderItem={({ item }) => (
            <Reactor
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                toggle();
                navigation.navigate("User", {
                  from,
                  id: item.creatorId,
                });
              }}
              reactor={item}
            />
          )}
          contentContainerStyle={{ paddingTop: 15, paddingBottom: 50 }}
        />
      </View>
    </BottomSheet>
  );
};

export default TweetReactions;
