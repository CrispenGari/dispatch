import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, FONTS, KEYS, pageLimits } from "../../constants";
import DropdownSelect from "react-native-input-select";
import { styles } from "../../styles";
import { useSettingsStore } from "../../store";
import type { SettingsType } from "../../types";
import { store } from "../../utils";
import Message from "../Message/Message";

const PageLimit = () => {
  const { setSettings, settings } = useSettingsStore();
  const [form, setForm] = React.useState({
    limit: pageLimits[0].value,
    message: "",
  });

  const onValueChange = (limit: number) => {
    setForm((state) => ({ ...state, limit }));
  };
  const save = async () => {
    const s: SettingsType = { ...settings, pageLimit: form.limit };
    await store(KEYS.APP_SETTINGS, JSON.stringify(s));
    setSettings(s);
  };
  React.useEffect(() => {
    if (settings) {
      setForm((state) => ({ ...state, limit: settings.pageLimit }));
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
    <View style={{ maxWidth: 500, backgroundColor: COLORS.main, padding: 5 }}>
      {!!form.message ? (
        <Message error={false} message={form.message} type="primary" />
      ) : null}
      <Text style={[styles.p, { fontSize: 18 }]}>Feed pagination limit</Text>
      <DropdownSelect
        placeholder="Page Limit"
        options={pageLimits}
        optionLabel={"name"}
        optionValue={"value"}
        selectedValue={form.limit}
        isMultiple={false}
        helperText="Set the default page limit for your tweets, comments and replies."
        dropdownContainerStyle={{
          maxWidth: 500,
          marginTop: 0,
          flex: 1,
          padding: 0,
          backgroundColor: COLORS.main,
          marginBottom: 0,
        }}
        dropdownIconStyle={{ top: 5, right: 15 }}
        dropdownStyle={{
          borderWidth: 0,
          borderBottomWidth: 1,
          paddingVertical: 0,
          paddingHorizontal: 20,
          minHeight: 30,
          flex: 1,
          maxWidth: 500,
          borderColor: COLORS.primary,
          borderRadius: 0,
          backgroundColor: COLORS.main,
        }}
        selectedItemStyle={{
          color: COLORS.black,
          fontFamily: FONTS.regular,
          fontSize: 16,
        }}
        placeholderStyle={{
          fontFamily: FONTS.regular,
          fontSize: 16,
        }}
        onValueChange={onValueChange}
        labelStyle={{
          fontFamily: FONTS.regularBold,
          fontSize: 16,
        }}
        primaryColor={COLORS.primary}
        dropdownHelperTextStyle={{
          color: COLORS.black,
          fontFamily: FONTS.regular,
          fontSize: 15,
        }}
        modalOptionsContainerStyle={{
          padding: 10,
          backgroundColor: COLORS.main,
        }}
        checkboxComponentStyles={{
          checkboxSize: 10,
          checkboxStyle: {
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            padding: 5,
            borderColor: COLORS.tertiary,
          },
          checkboxLabelStyle: {
            color: COLORS.black,
            fontSize: 16,
            fontFamily: FONTS.regular,
          },
        }}
      />
      {settings.pageLimit === form.limit ? null : (
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

export default PageLimit;
