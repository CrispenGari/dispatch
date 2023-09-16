import React from "react";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { View } from "react-native";
import TypeWriter from "react-native-typewriter";
import { COLORS } from "../../constants";
import { styles } from "../../styles";
import { AuthFieldType } from "../../types";

const AuthFormInput: React.FunctionComponent<{
  input: AuthFieldType;
  keyboardType: KeyboardTypeOptions | undefined;
  placeholder: string;
  label: string;
  error?: string;
  setForm: React.Dispatch<
    React.SetStateAction<{
      email: AuthFieldType;
      nickname: AuthFieldType;
      password: AuthFieldType;
      currentIndex: number;
    }>
  >;
  onSubmitEditing?:
    | ((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void)
    | undefined;
  secureTextEntry?: boolean;
  editable?: boolean;
}> = ({
  placeholder,
  keyboardType,
  input,
  error,
  label,
  setForm,
  onSubmitEditing,
  secureTextEntry,
  editable,
}) => {
  return (
    <View style={{ maxWidth: 500, width: "100%" }}>
      <TypeWriter style={[styles.p]} typing={1} maxDelay={-50}>
        {label}
      </TypeWriter>
      <CustomTextInput
        editable={editable}
        keyboardType={keyboardType}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        inputStyle={{
          width: "100%",
          fontSize: 20,
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}
        text={input.value}
        onChangeText={(text) => {
          if (input.title === "email") {
            setForm((state) => ({
              ...state,
              email: {
                ...state.email,
                value: text,
              },
            }));
          }
          if (input.title === "password") {
            setForm((state) => ({
              ...state,
              password: {
                ...state.password,
                value: text,
              },
            }));
          }
          if (input.title === "nickname") {
            setForm((state) => ({
              ...state,
              nickname: {
                ...state.nickname,
                value: text,
              },
            }));
          }
        }}
        onSubmitEditing={onSubmitEditing}
      />
      <TypeWriter
        style={[styles.p, { color: COLORS.red }]}
        typing={1}
        maxDelay={-50}
      >
        {error}
      </TypeWriter>
    </View>
  );
};

export default AuthFormInput;
