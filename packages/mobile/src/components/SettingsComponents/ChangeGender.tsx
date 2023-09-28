import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import TypeWriter from "react-native-typewriter";
import { styles } from "../../styles";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import { COLORS, FONTS, KEYS, genders } from "../../constants";
import { trpc } from "../../utils/trpc";
import { onImpact, store } from "../../utils";
import Ripple from "../ProgressIndicators/Ripple";
import Message from "../Message/Message";
import { GenderType } from "../../types";
import DropdownSelect from "react-native-input-select";

const ChangeGender = () => {
  const { me } = useMeStore();
  const [form, setForm] = React.useState({
    gender: genders.at(-1)!.value,
    error: "",
    message: "",
  });
  const { settings } = useSettingsStore();
  const { mutateAsync: mutateUpdateGender, isLoading } =
    trpc.user.updateGender.useMutation();
  React.useEffect(() => {
    if (!!me) {
      setForm((state) => ({ ...state, gender: me.gender }));
    }
  }, [me]);
  React.useEffect(() => {
    if (!!form.error || !!form.message) {
      const timeoutId = setTimeout(() => {
        setForm((state) => ({ ...state, error: "", message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);
  const update = () => {
    if (settings.haptics) {
      onImpact();
    }
    mutateUpdateGender({ gender: form.gender }).then(async (data) => {
      if (data.error) {
        setForm((state) => ({ ...state, message: "", error: data.error }));
      }
      if (data.jwt) {
        setForm((state) => ({
          ...state,
          message: "Your profile gender has been updated.",
          error: "",
        }));
        await store(KEYS.TOKEN_KEY, data.jwt);
      }
    });
  };

  const changeGender = (gender: GenderType) => {
    setForm((state) => ({ ...state, gender }));
  };

  return (
    <View style={{ maxWidth: 500, padding: 10, width: "100%" }}>
      <TypeWriter style={[styles.p]} typing={1} maxDelay={-50}>
        Update gender
      </TypeWriter>

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <DropdownSelect
          placeholder="Change Theme."
          options={genders}
          optionLabel={"name"}
          optionValue={"value"}
          selectedValue={form.gender}
          isMultiple={false}
          helperText="You can change your gender as 'male' or 'female' or 'undefined'."
          dropdownContainerStyle={{
            maxWidth: 500,
            marginTop: 4,
            flex: 1,
            padding: 0,
            backgroundColor: COLORS.main,
            marginBottom: 0,
          }}
          dropdownIconStyle={{ top: 10, right: 15 }}
          dropdownStyle={{
            borderWidth: 0.5,
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
          onValueChange={changeGender}
          labelStyle={{
            fontFamily: FONTS.regularBold,
            fontSize: 14,
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={update}
          disabled={isLoading}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 5,
              borderRadius: 0,
              maxWidth: 100,
              marginLeft: 5,
            },
          ]}
        >
          <Text
            style={[
              styles.button__text,
              {
                marginRight: isLoading ? 10 : 0,
                fontSize: 16,
              },
            ]}
          >
            UPDATE
          </Text>
          {isLoading ? <Ripple color={COLORS.tertiary} size={5} /> : null}
        </TouchableOpacity>
      </View>
      {!!form.error ? <Message error={true} message={form.error} /> : null}
      {!!form.message ? (
        <Message error={false} message={form.message} type="primary" />
      ) : null}
    </View>
  );
};

export default ChangeGender;
