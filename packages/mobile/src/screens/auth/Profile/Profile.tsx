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
import { onImpact, store } from "../../../utils";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMediaQuery } from "../../../hooks";
import { useMeStore, useSettingsStore } from "../../../store";

const Profile: React.FunctionComponent<AuthNavProps<"Profile">> = ({
  navigation,
  route,
}) => {
  const { settings } = useSettingsStore();
  const {
    dimension: { height },
  } = useMediaQuery();

  const { me } = useMeStore();

  const { mutateAsync: mutateVerify, isLoading: verifying } =
    trpc.auth.verify.useMutation();

  const { mutateAsync: mutateAuthProfile, isLoading: updating } =
    trpc.profile.authProfile.useMutation();

  const save = () => {
    if (settings.haptics) {
      onImpact();
    }
    mutateAuthProfile({ gender: form.gender, bio: form.bio }).then(
      async (res) => {
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
      }
    );
  };
  const [form, setForm] = React.useState({
    gender: genders.at(-1)!.value,
    height: 40,
    bio: "",
  });
  const changeGender = (gender: GenderType) => {
    setForm((state) => ({ ...state, gender }));
  };

  React.useEffect(() => {
    if (!!me) {
      setForm((state) => ({ ...state, gender: me.gender, bio: me.bio || "" }));
    }
  }, [me]);
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
                if (settings.haptics) {
                  onImpact();
                }
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
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1, padding: 10, backgroundColor: COLORS.main }}
    >
      <View style={{ flex: 1, height }}>
        <View
          style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}
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
        <View style={{ flex: 0.5, alignItems: "center" }}>
          <Divider
            color={COLORS.black}
            title="Select your profile gender and biography."
          />
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

          <CustomTextInput
            containerStyles={{
              borderColor: COLORS.primary,
            }}
            placeholder={`Don't be shy about your bio...`}
            inputStyle={{
              height: form.height,
              maxHeight: 100,
              paddingVertical: 10,
            }}
            multiline
            text={form.bio}
            onContentSizeChange={(e) => {
              e.persist();
              setForm((state) => ({
                ...state,
                height: e.nativeEvent?.contentSize?.height + 20 ?? form.height,
              }));
            }}
            onChangeText={(bio) => setForm((state) => ({ ...state, bio }))}
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
                maxWidth: 120,
              },
            ]}
          >
            <Text style={[styles.button__text, { margin: updating ? 10 : 0 }]}>
              CONTINUE
            </Text>
            {updating ? <Ripple color={COLORS.tertiary} size={5} /> : null}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Profile;
