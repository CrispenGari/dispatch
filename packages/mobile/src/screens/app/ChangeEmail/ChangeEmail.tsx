import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { APP_NAME, COLORS, FONTS, KEYS } from "../../../constants";
import { useMeStore, useSettingsStore } from "../../../store";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { onImpact, store } from "../../../utils";
import { usePlatform } from "../../../hooks";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { styles } from "../../../styles";
import Message from "../../../components/Message/Message";
import { trpc } from "../../../utils/trpc";

const ChangeEmail: React.FunctionComponent<AppNavProps<"ChangeEmail">> = ({
  navigation,
  route,
}) => {
  const { me, setMe } = useMeStore();
  const { os } = usePlatform();
  const [form, setForm] = React.useState({
    email: "",
    error: "",
    message: "",
  });
  const { mutateAsync: mutateLogout, isLoading: logging } =
    trpc.auth.logout.useMutation();
  const { settings } = useSettingsStore();
  const { mutateAsync: mutateUpdateEmail, isLoading } =
    trpc.user.updateEmail.useMutation();
  React.useEffect(() => {
    if (!!me) {
      setForm((state) => ({ ...state, email: me.email }));
    }
  }, [me]);

  React.useEffect(() => {
    if (!!form.error || !!form.message) {
      const timeoutId = setTimeout(async () => {
        if (!!form.message) {
          mutateLogout().then(async (res) => {
            if (res) {
              setMe(null);
            }
          });
        }
        setForm((state) => ({ ...state, error: "", message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);

  const update = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (form.email.trim().toLowerCase() === me?.email) return;
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
            mutateUpdateEmail({ email: form.email }).then(async (data) => {
              if (data.error) {
                setForm((state) => ({
                  ...state,
                  message: "",
                  error: data.error,
                }));
              }
              if (data.jwt) {
                setForm((state) => ({
                  ...state,
                  message:
                    "Your email has been updated you will be logged out in 5 seconds so that you can verify your email.",
                  error: "",
                }));
                await store(KEYS.TOKEN_KEY, data.jwt);
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
      headerTitle: "Change Account Email",
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
          label={os === "ios" ? route.params.from : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, settings, route]);
  return (
    <View
      style={{ flex: 1, alignSelf: "center", width: "100%", maxWidth: 500 }}
    >
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
            keyboardType={"email-address"}
            placeholder={"Email address"}
            containerStyles={{
              paddingHorizontal: 0,
              marginTop: 4,
              flex: 1,
              borderRadius: 0,
            }}
            inputStyle={{
              width: "100%",
              padding: 5,
              fontSize: 18,
            }}
            text={form.email}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, email: text }))
            }
            onSubmitEditing={update}
          />

          {!!form.error ? <Message error={true} message={form.error} /> : null}
          {!!form.message ? (
            <Message error={false} message={form.message} type="primary" />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={update}
            disabled={isLoading || logging}
            style={[
              styles.button,
              {
                backgroundColor: COLORS.primary,
                padding: 5,
                borderRadius: 0,
                maxWidth: 100,
                marginTop: 5,
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
    </View>
  );
};

export default ChangeEmail;
