import React from "react";
import { View, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import { Tab } from "./Tab";
import { useSettingsStore } from "../../store";
import { onImpact } from "../../utils";

const TAB_BAR_HEIGHT: number = 30;
const TAB_BAR_WIDTH: number = 300;

export const Tabs: React.FunctionComponent<{
  setForm: React.Dispatch<
    React.SetStateAction<{
      tab: "tweets" | "mentions";
    }>
  >;
  tab: "tweets" | "mentions";
}> = ({ setForm, tab }) => {
  const { settings } = useSettingsStore();
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 25,
        backgroundColor: COLORS.main,
        borderRadius: 5,
        width: TAB_BAR_WIDTH,
        alignSelf: "center",
        paddingHorizontal: 10,
        overflow: "hidden",
        paddingVertical: 2,
        height: TAB_BAR_HEIGHT,
      }}
    >
      <ActiveTabIndicator tabNumber={["tweets", "mentions"].indexOf(tab)} />
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.7}
        onPress={() => {
          if (settings.haptics) {
            onImpact();
          }
          setForm((state) => ({ ...state, tab: "tweets" }));
        }}
      >
        <Tab title="tweets" />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        activeOpacity={0.7}
        onPress={() => {
          if (settings.haptics) {
            onImpact();
          }
          setForm((state) => ({ ...state, tab: "mentions" }));
        }}
      >
        <Tab title="mentions" />
      </TouchableOpacity>
    </View>
  );
};

const ActiveTabIndicator: React.FunctionComponent<{
  tabNumber: number;
}> = ({ tabNumber }) => {
  return (
    <View
      style={[
        {
          position: "absolute",
          height: TAB_BAR_HEIGHT,
          width: TAB_BAR_WIDTH / 2,
          borderColor: COLORS.primary,
          left: (TAB_BAR_WIDTH / 2) * tabNumber,
          borderWidth: 3,
          shadowRadius: 5,
        },
      ]}
    />
  );
};
