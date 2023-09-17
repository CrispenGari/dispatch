import { View, Linking, ScrollView } from "react-native";
import React from "react";
import { AppNavProps } from "../../../params";
import { COLORS } from "../../../constants";

const Settings: React.FunctionComponent<AppNavProps<"Settings">> = ({
  navigation,
}) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Settings" });
  }, [navigation]);
  return (
    <ScrollView
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100,
      }}
      style={{ backgroundColor: COLORS.main, flex: 1 }}
    >
      {/* <Label title="MANAGE PROFILE" />
      <ProfileAccount />
      <Label title="ACCOUNT BALANCES" />
      <ProfileBank />
      <Label title="ACCOUNT STARTERS" />
      <ProfileStarters />
      <Label title="MISC" />
      <SettingItem
        title={settings.haptics ? "Disable Haptics" : "Enable Haptics"}
        Icon={
          settings.haptics ? (
            <MaterialCommunityIcons
              name="vibrate"
              size={24}
              color={COLORS.black}
            />
          ) : (
            <MaterialCommunityIcons
              name="vibrate-off"
              size={24}
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
        title={
          settings.sound
            ? "Disable Sound Notifications"
            : "Enable Sound Notifications"
        }
        Icon={
          settings.sound ? (
            <Ionicons
              name="ios-notifications-circle"
              size={24}
              color={COLORS.black}
            />
          ) : (
            <Ionicons
              name="ios-notifications-off-circle"
              size={24}
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
        Icon={<MaterialIcons name="star-rate" size={24} color={COLORS.black} />}
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
          <MaterialIcons name="system-update" size={24} color={COLORS.black} />
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
        Icon={<Entypo name="text-document" size={24} color={COLORS.black} />}
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
          navigation.navigate("TermsOfUse");
        }}
      />
      <SettingItem
        title={"Privacy Policy"}
        Icon={
          <MaterialIcons name="privacy-tip" size={24} color={COLORS.black} />
        }
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
          navigation.navigate("PrivacyPolicy");
        }}
      />

      <Label title="MANAGE ACCOUNT" />
      <SettingItem
        title={"Change Email"}
        Icon={
          <MaterialIcons name="attach-email" size={24} color={COLORS.black} />
        }
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
        }}
      />
      <SettingItem
        title={"Change Nickname"}
        Icon={<Feather name="user" size={24} color={COLORS.black} />}
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
        }}
      />
      <SettingItem
        title={"Change Password"}
        Icon={<Entypo name="key" size={24} color={COLORS.black} />}
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
        }}
      />
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
        title={"Delete Account"}
        Icon={<AntDesign name="deleteuser" size={24} color={COLORS.red} />}
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
        }}
      />
      <Label title="ISSUES & BUGS" />
      <SettingItem
        title="Report an Issue"
        Icon={<Entypo name="bug" size={24} color={COLORS.red} />}
        onPress={async () => {
          if (settings.haptics) {
            onImpact();
          }
          await Linking.openURL(
            "https://github.com/CrispenGari/invitee/issues"
          );
        }}
      /> */}
    </ScrollView>
  );
};

export default Settings;
