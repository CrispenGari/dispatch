import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useSettingsStore } from "../../store";
import { BottomSheet } from "react-native-btr";
import { COLORS, sorts } from "../../constants";
import { styles } from "../../styles";
import { onImpact } from "../../utils";

interface Props {
  open: boolean;
  toggle: () => void;
  sort: {
    id: number;
    value: "asc" | "desc";
    name: string;
  };
  setSort: React.Dispatch<
    React.SetStateAction<{
      id: number;
      value: "asc" | "desc";
      name: string;
    }>
  >;
}
const TweetSort: React.FunctionComponent<Props> = ({
  open,
  toggle,
  sort,
  setSort,
}) => {
  const { settings } = useSettingsStore();
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
          height: 130,
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
          <Text style={[styles.h1, {}]}>Sort Tweets</Text>
        </View>
        <View style={{ height: 20 }} />
        {sorts.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={{
              flexDirection: "row",
              padding: 10,
              alignItems: "center",
              width: "100%",
            }}
            onPress={() => {
              if (settings.haptics) {
                onImpact();
              }
              setSort(s);
              toggle();
            }}
          >
            <View
              style={{
                marginRight: 20,
                width: 20,
                height: 20,
                borderWidth: 2,
                borderRadius: 10,
                borderColor: COLORS.tertiary,
                overflow: "hidden",
                padding: 2,
              }}
            >
              {sort.value === s.value ? (
                <View
                  style={{
                    backgroundColor: COLORS.primary,
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                  }}
                />
              ) : null}
            </View>
            <Text style={[styles.h1, { fontSize: 18 }]}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
};

export default TweetSort;
