import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { AuthNavProps } from "../../../params";
import { styles } from "../../../styles";
import { COLORS, FONTS, genders, logo, profile } from "../../../constants";
import Divider from "../../../components/Divider/Divider";
import DropdownSelect from "react-native-input-select";
import { GenderType } from "../../../types";

const Profile: React.FunctionComponent<AuthNavProps<"Profile">> = ({
  navigation,
}) => {
  const save = () => {};
  const [gender, setGender] = React.useState(genders.at(-1));

  const changeGender = (gender: GenderType) => {
    console.log({ gender });
  };
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: COLORS.main }}>
      <View
        style={{ flex: 0.7, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={{
            uri: Image.resolveAssetSource(logo).uri,
          }}
          style={{
            width: 100,
            height: 100,
            marginBottom: 10,
            resizeMode: "contain",
            marginTop: 30,
          }}
        />
        <Text
          style={[
            styles.h1,
            {
              fontSize: 20,
              fontFamily: FONTS.regularBold,
            },
          ]}
        >
          Your Profile
        </Text>

        <Image
          style={{
            width: 150,
            height: 150,
            marginVertical: 10,
            borderRadius: 150,
          }}
          source={{ uri: Image.resolveAssetSource(profile).uri }}
        />
      </View>
      <View style={{ flex: 0.3, alignItems: "center" }}>
        <Divider color={COLORS.black} title="Select your profile gender." />
        <DropdownSelect
          placeholder="Change Theme."
          options={genders}
          optionLabel={"name"}
          optionValue={"value"}
          selectedValue={gender!.value}
          isMultiple={false}
          helperText="You can change your gender as 'male' or 'female' or 'undefined'."
          dropdownContainerStyle={{
            marginBottom: 40,
            maxWidth: 500,
            marginTop: 20,
          }}
          dropdownIconStyle={{ top: 15, right: 15 }}
          dropdownStyle={{
            borderWidth: 0.5,
            paddingVertical: 8,
            paddingHorizontal: 20,
            minHeight: 45,
            maxWidth: 500,
            backgroundColor: COLORS.main,
            borderColor: COLORS.primary,
            minWidth: "100%",
          }}
          selectedItemStyle={{
            color: COLORS.black,
            fontFamily: FONTS.regular,
            fontSize: 18,
          }}
          placeholderStyle={{
            fontFamily: FONTS.regular,
            fontSize: 18,
          }}
          onValueChange={changeGender}
          labelStyle={{ fontFamily: FONTS.regularBold, fontSize: 20 }}
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
              fontSize: 18,
              fontFamily: FONTS.regular,
            },
          }}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={save}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 10,
              borderRadius: 5,
              alignSelf: "flex-end",
              marginTop: 10,
              maxWidth: 200,
            },
          ]}
        >
          <Text style={[styles.button__text]}>SAVE PROFILE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
