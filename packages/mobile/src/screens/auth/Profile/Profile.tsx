import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { AuthNavProps } from "../../../params";
import { styles } from "../../../styles";
import {
  APP_NAME,
  COLORS,
  FONTS,
  KEYS,
  genders,
  logo,
  profile,
} from "../../../constants";
import Divider from "../../../components/Divider/Divider";
import DropdownSelect from "react-native-input-select";
import { GenderType } from "../../../types";
import { trpc } from "../../../utils/trpc";
import Loading from "../../../components/Loading/Loading";
import { store } from "../../../utils";
import Ripple from "../../../components/ProgressIndicators/Ripple";

const Profile: React.FunctionComponent<AuthNavProps<"Profile">> = ({
  navigation,
  route,
}) => {
  const { mutateAsync: mutateVerify, isLoading: verifying } =
    trpc.auth.verify.useMutation();

  const { mutateAsync: mutateAuthProfile, isLoading: updating } =
    trpc.profile.authProfile.useMutation();

  const save = () => {
    mutateAuthProfile({ gender }).then(async (res) => {
      if (res.error) {
        Alert.alert(
          APP_NAME,
          res.error,
          [
            {
              style: "default",
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      }
      if (res.jwt) {
        await store(KEYS.TOKEN_KEY, res.jwt);
        navigation.replace("Landing");
      }
    });
  };
  const [gender, setGender] = React.useState(genders.at(-1)!.value);
  const changeGender = (gender: GenderType) => {
    setGender(gender);
  };

  React.useEffect(() => {
    mutateVerify({ code: route.params.code }).then(async (res) => {
      if (res.error) {
        Alert.alert(
          APP_NAME,
          res.error,
          [
            {
              style: "default",
              text: "OK",
              onPress: () => {
                navigation.replace("Register");
              },
            },
          ],
          { cancelable: false }
        );
      }
      if (res.jwt) {
        await store(KEYS.TOKEN_KEY, res.jwt);
        Alert.alert(
          APP_NAME,
          "Your account email has been verified on dispatch.",
          [
            {
              style: "default",
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      }
    });
  }, [route]);
  if (verifying) return <Loading />;
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
          selectedValue={gender}
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
          disabled={updating}
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
          <Text style={[styles.button__text, { margin: updating ? 10 : 0 }]}>
            SAVE PROFILE
          </Text>
          {updating ? <Ripple color={COLORS.tertiary} size={5} /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
