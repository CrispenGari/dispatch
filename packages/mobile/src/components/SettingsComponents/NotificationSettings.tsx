import { View, Text } from "react-native";
import React from "react";
import { COLORS, KEYS } from "../../constants";
import { CheckBox } from "react-native-btr";
import { styles } from "../../styles";
import { useSettingsStore } from "../../store";
import { onImpact, store } from "../../utils";
import type { SettingsType } from "../../types";

const NotificationSettings = () => {
  const { settings, setSettings } = useSettingsStore();
  const [form, setForm] = React.useState({
    reaction: true,
    comment: true,
    reply: true,
    tweet: true,
    mention: true,
    vote: true,
  });

  React.useEffect(() => {
    setForm(settings.notifications);
  }, [settings]);

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 500,
        backgroundColor: COLORS.main,
        paddingHorizontal: 10,
        marginVertical: 10,
      }}
    >
      {Object.entries(form).map(([title, value]) => (
        <View
          key={title}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
            paddingVertical: 5,
            width: "100%",
          }}
        >
          <CheckBox
            checked={value}
            color={COLORS.primary}
            disabled={false}
            onPress={async () => {
              if (settings.haptics) {
                onImpact();
              }
              const s: SettingsType = {
                ...settings,
                notifications: {
                  ...settings.notifications,
                  [title]: !value,
                },
              };
              await store(KEYS.APP_SETTINGS, JSON.stringify(s));
              setSettings(s);
            }}
          />
          <Text
            style={[
              styles.p,
              {
                flex: 1,
                marginLeft: 10,
                fontSize: 20,
              },
            ]}
          >
            {value ? "Disable" : "Enable"} notification on {title}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default NotificationSettings;
