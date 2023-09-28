import {
  View,
  StyleProp,
  ViewStyle,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
  TextInputSubmitEditingEventData,
  NativeSyntheticEvent,
  TextStyle,
  TextInputContentSizeChangeEventData,
} from "react-native";
import React from "react";
import { COLORS, FONTS } from "../../constants";

interface Props {
  inputStyle: StyleProp<TextStyle>;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  text: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  editable: boolean;
  onSubmitEditing: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  numberOfLines: number;
  multiline: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyles?: StyleProp<ViewStyle>;
  onContentSizeChange?:
    | ((e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void)
    | undefined;
}
const CustomTextInput: React.FunctionComponent<Partial<Props>> = ({
  placeholder,
  inputStyle,
  keyboardType,
  text,
  onChangeText,
  editable,
  onContentSizeChange,
  onSubmitEditing,
  secureTextEntry,
  multiline,
  numberOfLines,
  onRightIconPress,
  leftIcon,
  rightIcon,
  containerStyles,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          width: "100%",
          backgroundColor: "white",
          borderRadius: 5,
          padding: 0,
          alignItems: "center",
          borderWidth: 0.5,
          borderColor: COLORS.primary,
          marginBottom: 5,
        },
        containerStyles,
      ]}
    >
      {leftIcon}
      <TextInput
        placeholder={placeholder}
        onContentSizeChange={onContentSizeChange}
        style={[
          {
            flex: 1,
            marginHorizontal: 10,
            borderRadius: 5,
            fontFamily: FONTS.regular,
            fontSize: 18,
            paddingVertical: 5,
            paddingHorizontal: 10,
          },
          inputStyle,
        ]}
        keyboardType={keyboardType}
        value={text}
        onChangeText={onChangeText}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry={secureTextEntry}
        numberOfLines={numberOfLines}
        multiline={multiline}
      />
      <TouchableOpacity activeOpacity={0.7} onPress={onRightIconPress}>
        {rightIcon}
      </TouchableOpacity>
    </View>
  );
};

export default CustomTextInput;
