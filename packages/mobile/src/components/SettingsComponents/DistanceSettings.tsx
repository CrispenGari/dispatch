import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, KEYS } from "../../constants";
import { styles } from "../../styles";
import Slider from "@react-native-community/slider";
import type { SettingsType } from "../../types";
import { useSettingsStore } from "../../store";
import { store } from "../../utils";

import Message from "../Message/Message";

const DistanceSettings = () => {
  const { settings, setSettings } = useSettingsStore();

  const [form, setForm] = React.useState({
    distance: 10,
    message: "",
  });

  const save = async () => {
    const s: SettingsType = { ...settings, radius: form.distance };
    await store(KEYS.APP_SETTINGS, JSON.stringify(s));
    setSettings(s);
  };

  React.useEffect(() => {
    if (settings) {
      setForm((state) => ({ ...state, distance: settings.radius }));
    }
  }, [settings]);

  React.useEffect(() => {
    if (!!form.message) {
      const timeoutId = setTimeout(async () => {
        setForm((state) => ({ ...state, message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);

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
      {!!form.message ? (
        <Message error={false} message={form.message} type="primary" />
      ) : null}
      <Text style={[styles.p, { fontSize: 18 }]}>Tweets radius</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Slider
          style={{ width: "100%", height: 20, flex: 1, marginLeft: 0 }}
          minimumValue={0}
          maximumValue={100}
          lowerLimit={1}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.tertiary}
          thumbTintColor={COLORS.main}
          value={form.distance}
          onValueChange={(value) =>
            setForm((state) => ({ ...state, distance: value }))
          }
        />
        <Text style={[styles.h1, { fontSize: 20, marginLeft: 10 }]}>
          {form.distance.toFixed(1)} km.
        </Text>
      </View>
      <Text style={[styles.p, { fontSize: 16 }]}>
        Slide to set the maximum distance for news.
      </Text>
      {settings.radius === form.distance ? null : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={save}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 5,
              borderRadius: 0,
              maxWidth: 100,
              marginTop: 10,
            },
          ]}
        >
          <Text
            style={[
              styles.button__text,
              {
                fontSize: 16,
              },
            ]}
          >
            SAVE
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DistanceSettings;
