import { View, Linking, Alert } from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import { APP_NAME, COLORS, FONTS, KEYS } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Divider from "../../../components/Divider/Divider";
import SettingItem from "../../../components/SettingItem/SettingItem";
import { useMeStore, useSettingsStore } from "../../../store";

import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import {
  del,
  onFetchUpdateAsync,
  onImpact,
  rateApp,
  store,
} from "../../../utils";
import type { SettingsType } from "../../../types";
import Profile from "../../../components/SettingsComponents/Profile";
import ChangeNickname from "../../../components/SettingsComponents/ChangeNickname";
import ChangeGender from "../../../components/SettingsComponents/ChangeGender";
import ChangeBio from "../../../components/SettingsComponents/ChangeBio";
import Message from "../../../components/Message/Message";
import { trpc } from "../../../utils/trpc";
import PageLimit from "../../../components/SettingsComponents/PageLimit";
import DistanceSettings from "../../../components/SettingsComponents/DistanceSettings";

const Settings: React.FunctionComponent<AppNavProps<"Settings">> = ({
  navigation,
}) => {
  const { isLoading: sending, mutateAsync: mutateSendForgotPasswordLink } =
    trpc.auth.sendForgotPasswordLink.useMutation();
  const { isLoading: deleting, mutateAsync: mutateDeleteAccount } =
    trpc.user.deleteAccount.useMutation();
  const { os } = usePlatform();
  const { me, setMe } = useMeStore();
  const { settings, setSettings } = useSettingsStore();
  const [form, setForm] = React.useState({
    error: "",
    message: "",
  });

  React.useEffect(() => {
    if (!!form.error || !!form.message) {
      const timeoutId = setTimeout(async () => {
        setForm((state) => ({ ...state, error: "", message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);

  const deleteAccount = () => {
    if (deleting) return;
    Alert.alert(
      APP_NAME,
      "When you delete your account, this is an irreversible action you will lost your account forever.",
      [
        {
          text: "DELETE ACCOUNT",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            mutateDeleteAccount().then(async (data) => {
              if (data.error) {
                setForm((state) => ({
                  ...state,
                  message: "",
                  error: data.error,
                }));
              } else {
                await del(KEYS.TOKEN_KEY);
                setMe(null);
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
  const sendResetPasswordLink = () => {
    if (!!!me || sending) return;
    mutateSendForgotPasswordLink({ email: me.email }).then(async (data) => {
      if (data.error) {
        setForm((state) => ({ ...state, error: data.error, message: "" }));
      }
      if (data.jwt) {
        setForm((state) => ({
          ...state,
          message:
            "The reset password link has been sent to your email. Please open your emails to change the account password!",
          error: "",
        }));
        await store(KEYS.TOKEN_KEY, data.jwt);
      }
    });
  };
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Settings",
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
          label={os === "ios" ? "Feed" : ""}
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
    <View
      style={{
        flex: 1,
        alignSelf: "center",
        width: "100%",
        maxWidth: 500,
      }}
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
        <Profile />
        <Divider color={COLORS.black} title="MISC" />
        <SettingItem
          title={settings.haptics ? "Disable Haptics" : "Enable Haptics"}
          Icon={
            settings.haptics ? (
              <MaterialCommunityIcons
                name="vibrate"
                size={18}
                color={COLORS.black}
              />
            ) : (
              <MaterialCommunityIcons
                name="vibrate-off"
                size={18}
                color={COLORS.black}
              />
            )
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            const s: SettingsType = {
              ...settings,
              haptics: !settings.haptics,
            };

            await store(KEYS.APP_SETTINGS, JSON.stringify(s));
            setSettings(s);
          }}
        />
        <SettingItem
          title={settings.sound ? "Disable Sound" : "Enable Sound"}
          Icon={
            settings.sound ? (
              <Ionicons
                name="ios-notifications-circle"
                size={18}
                color={COLORS.black}
              />
            ) : (
              <Ionicons
                name="ios-notifications-off-circle"
                size={18}
                color={COLORS.black}
              />
            )
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            const s: SettingsType = {
              ...settings,
              sound: !settings.sound,
            };

            await store(KEYS.APP_SETTINGS, JSON.stringify(s));
            setSettings(s);
          }}
        />
        <SettingItem
          title={"Rate invitee"}
          Icon={
            <MaterialIcons name="star-rate" size={18} color={COLORS.black} />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            await rateApp();
          }}
        />
        <SettingItem
          title={"Check for Updates"}
          Icon={
            <MaterialIcons
              name="system-update"
              size={18}
              color={COLORS.black}
            />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            await onFetchUpdateAsync();
          }}
        />
        <SettingItem
          title={"Terms of Use"}
          Icon={
            <Ionicons
              name="document-text-outline"
              size={18}
              color={COLORS.black}
            />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("AppTermsOfUse", { from: "Settings" });
          }}
        />
        <SettingItem
          title={"Privacy Policy"}
          Icon={
            <MaterialIcons name="privacy-tip" size={18} color={COLORS.black} />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("AppPrivacyPolicy", { from: "Settings" });
          }}
        />
        <Divider color={COLORS.black} title="FEED PREFERENCE" />
        <PageLimit />
        <DistanceSettings />
        <Divider color={COLORS.black} title="MANAGE PROFILE" />
        <ChangeNickname />
        <ChangeBio />
        <ChangeGender />
        <Divider color={COLORS.black} title="MANAGE ACCOUNT" />

        <View style={{ maxWidth: 500, paddingHorizontal: 10 }}>
          {!!form.error ? <Message error={true} message={form.error} /> : null}
          {!!form.message ? (
            <Message error={false} message={form.message} type="primary" />
          ) : null}
        </View>

        <SettingItem
          title={"Blocked Users"}
          Icon={
            <MaterialIcons name="app-blocking" size={18} color={COLORS.black} />
          }
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("Blocked", { from: "Settings" });
          }}
        />
        <SettingItem
          title={"Forgot Password"}
          Icon={
            <MaterialCommunityIcons
              name="lock-reset"
              size={18}
              color={COLORS.black}
            />
          }
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            sendResetPasswordLink();
          }}
        />
        <SettingItem
          title={"Change Password"}
          titleColor={COLORS.red}
          Icon={<Ionicons name="key-outline" size={18} color={COLORS.red} />}
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("ChangePassword", { from: "Settings" });
          }}
        />
        <SettingItem
          title={"Change Email"}
          titleColor={COLORS.red}
          Icon={
            <MaterialCommunityIcons
              name="email-alert-outline"
              size={18}
              color={COLORS.red}
            />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("ChangeEmail", {
              from: "Settings",
            });
          }}
        />
        <SettingItem
          title={"Delete Account"}
          titleColor={COLORS.red}
          Icon={
            <MaterialCommunityIcons
              name="delete-empty-outline"
              size={18}
              color={COLORS.red}
            />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            deleteAccount();
          }}
        />
        <Divider color={COLORS.black} title="ISSUES & BUGS" />
        <SettingItem
          title="Report an Issue"
          titleColor={COLORS.red}
          Icon={
            <MaterialIcons name="sync-problem" size={18} color={COLORS.red} />
          }
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            await Linking.openURL(
              "https://github.com/CrispenGari/dispatch/issues"
            );
          }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Settings;
