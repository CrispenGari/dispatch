import { View, Linking, ScrollView } from "react-native";
import React from "react";
import { AppNavProps } from "../../../params";
import { COLORS, FONTS, KEYS } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { usePlatform } from "../../../hooks";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Divider from "../../../components/Divider/Divider";
import SettingItem from "../../../components/SettingItem/SettingItem";
import { useSettingsStore } from "../../../store";

import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { onFetchUpdateAsync, onImpact, rateApp, store } from "../../../utils";
import { SettingsType } from "../../../types";
import Profile from "../../../components/SettingsComponents/Profile";
import ChangeNickname from "../../../components/SettingsComponents/ChangeNickname";
import ChangeGender from "../../../components/SettingsComponents/ChangeGender";
import ChangeBio from "../../../components/SettingsComponents/ChangeBio";

const Settings: React.FunctionComponent<AppNavProps<"Settings">> = ({
  navigation,
}) => {
  const { os } = usePlatform();
  const { settings, setSettings } = useSettingsStore();

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
        Icon={<MaterialIcons name="star-rate" size={18} color={COLORS.black} />}
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
          <MaterialIcons name="system-update" size={18} color={COLORS.black} />
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

      <Divider color={COLORS.black} title="MANAGE PROFILE" />
      <ChangeNickname />
      <ChangeBio />
      <ChangeGender />
      <Divider color={COLORS.black} title="MANAGE ACCOUNT" />

      <SettingItem
        title={"Reset Password"}
        Icon={
          <MaterialCommunityIcons
            name="lock-reset"
            size={24}
            color={COLORS.black}
          />
        }
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
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
          navigation.navigate("ChangePassword");
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
          navigation.navigate("ChangeEmail");
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
  );
};

export default Settings;
