import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { APP_NAME, COLORS, FONTS, KEYS } from "../../../constants";
import { useMeStore, useSettingsStore } from "../../../store";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { del, onImpact } from "../../../utils";
import { usePlatform } from "../../../hooks";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { styles } from "../../../styles";
import Message from "../../../components/Message/Message";
import { trpc } from "../../../utils/trpc";
import type { AppNavProps } from "../../../params";

const ChangePassword: React.FunctionComponent<
  AppNavProps<"ChangePassword">
> = ({ navigation }) => {
  const { setMe } = useMeStore();
  const { settings } = useSettingsStore();
  const { os } = usePlatform();
  const { mutateAsync: mutateUpdatePassword, isLoading } =
    trpc.user.changePassword.useMutation();
  const { mutateAsync: mutateLogout, isLoading: logging } =
    trpc.auth.logout.useMutation();
  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    error: "",
    message: "",
  });

  React.useEffect(() => {
    if (!!form.error || !!form.message) {
      const timeoutId = setTimeout(async () => {
        if (!!form.message) {
          mutateLogout().then(async (res) => {
            if (res) {
              await del(KEYS.TOKEN_KEY);
              setMe(null);
            }
          });
        }
        setForm((state) => ({ ...state, error: "", message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);
  const updatePassword = () => {
    if (settings.haptics) {
      onImpact();
    }

    Alert.alert(
      APP_NAME,
      "To update email you will be logged out of your account so that you can verify your email before you login.",
      [
        {
          text: "UPDATE",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            mutateUpdatePassword({
              confirmNewPassword: form.confirmNewPassword,
              currentPassword: form.currentPassword,
              newPassword: form.newPassword,
            }).then(async (data) => {
              if (data.error) {
                setForm((state) => ({
                  ...state,
                  message: "",
                  error: data.error,
                  confirmNewPassword: "",
                  newPassword: "",
                  currentPassword: "",
                }));
              }
              if (data.jwt) {
                setForm((state) => ({
                  ...state,
                  message:
                    "Your password has been updated you will be logged out in 5 seconds so that you can login with your new credentials.",
                  error: "",
                }));
              }
            });
          },
          style: "destructive",
        },
        {
          text: "CANCEL",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
          },
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Change Account Password",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0.5,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? "Settings" : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, settings]);
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingBottom: 100,
      }}
      style={{ backgroundColor: COLORS.main, flex: 1 }}
    >
      <View style={{ maxWidth: 500, padding: 10, marginTop: 10 }}>
        <CustomTextInput
          keyboardType={"default"}
          placeholder={"Current account password"}
          secureTextEntry
          containerStyles={{
            paddingHorizontal: 0,
            marginTop: 4,
            flex: 1,
            borderRadius: 0,
          }}
          inputStyle={{
            width: "100%",
            padding: 5,
            fontSize: 16,
          }}
          text={form.currentPassword}
          onChangeText={(text) =>
            setForm((state) => ({ ...state, currentPassword: text }))
          }
        />
        <CustomTextInput
          keyboardType={"default"}
          placeholder={"New account password"}
          secureTextEntry
          containerStyles={{
            paddingHorizontal: 0,
            marginTop: 4,
            flex: 1,
            borderRadius: 0,
          }}
          inputStyle={{
            width: "100%",
            padding: 5,
            fontSize: 16,
          }}
          text={form.newPassword}
          onChangeText={(text) =>
            setForm((state) => ({ ...state, newPassword: text }))
          }
        />
        <CustomTextInput
          keyboardType={"default"}
          placeholder={"Confirm new account password"}
          secureTextEntry
          containerStyles={{
            paddingHorizontal: 0,
            marginTop: 4,
            flex: 1,
            borderRadius: 0,
          }}
          inputStyle={{
            width: "100%",
            padding: 5,
            fontSize: 16,
          }}
          text={form.confirmNewPassword}
          onChangeText={(text) =>
            setForm((state) => ({ ...state, confirmNewPassword: text }))
          }
          onSubmitEditing={updatePassword}
        />
        {!!form.error ? <Message error={true} message={form.error} /> : null}
        {!!form.message ? (
          <Message error={false} message={form.message} type="primary" />
        ) : null}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={updatePassword}
          disabled={isLoading || logging}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 5,
              borderRadius: 0,
              maxWidth: 100,
            },
          ]}
        >
          <Text
            style={[
              styles.button__text,
              {
                marginRight: isLoading || logging ? 10 : 0,
                fontSize: 16,
              },
            ]}
          >
            UPDATE
          </Text>
          {isLoading || logging ? (
            <Ripple color={COLORS.tertiary} size={5} />
          ) : null}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ChangePassword;
