import { View, Text, ScrollView, Image } from "react-native";
import React from "react";
import type { AppNavProps } from "../../../params";
import { COLORS, FONTS, profile } from "../../../constants";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { useMeStore, useSettingsStore } from "../../../store";
import { usePlatform } from "../../../hooks";
import { trpc } from "../../../utils/trpc";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Tabs } from "../../../components/Tabs/Tabs";
import { styles } from "../../../styles";
import TweetsTab from "../../../components/Tabs/TweetsTab";
import MentionsTab from "../../../components/Tabs/MentionsTab";
import { onImpact } from "../../../utils";

const User: React.FunctionComponent<AppNavProps<"User">> = ({
  navigation,
  route,
}) => {
  const { os } = usePlatform();
  const { me } = useMeStore();
  const { settings } = useSettingsStore();
  const { data: user, refetch } = trpc.user.user.useQuery({
    id: route.params.id,
  });

  trpc.user.onViewProfile.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  const [form, setForm] = React.useState<{
    tab: "tweets" | "mentions";
  }>({
    tab: "tweets",
  });
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle:
        me?.id === user?.id ? `Your profile` : `${user?.nickname}'s profile`,
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
  }, [navigation, user, me, route, settings]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.main }}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 500,
          height: 100,
          backgroundColor: COLORS.primary,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={[
            styles.h1,
            { textAlign: "center", fontSize: 16, marginBottom: 10 },
          ]}
        >
          {user?.bio ||
            `No biography for ${user?.id === me?.id ? "you" : user?.nickname}.`}
        </Text>
        <Image
          source={{
            uri: Image.resolveAssetSource(profile).uri,
          }}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            marginRight: 5,
            borderRadius: 70,
            position: "absolute",
            bottom: -35,
          }}
        />
      </View>
      <View style={{ maxWidth: 500, marginTop: 30 }}>
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            justifyContent: "center",
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            <MaterialCommunityIcons
              name="post-outline"
              size={16}
              color="black"
            />
            <Text
              style={[
                styles.h1,
                { fontSize: 16, color: COLORS.darkGray, marginLeft: 10 },
              ]}
            >
              {user?.tweets.length || 0} tweets
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="ios-stats-chart-outline"
              size={16}
              color={COLORS.secondary}
            />
            <Text
              style={[
                styles.h1,
                { fontSize: 16, color: COLORS.darkGray, marginLeft: 10 },
              ]}
            >
              {user?.views} views
            </Text>
          </View>
        </View>
        <Tabs setForm={setForm} tab={form.tab} />
      </View>
      {!!user ? (
        form.tab === "tweets" ? (
          <TweetsTab uid={user.id} navigation={navigation} />
        ) : (
          <MentionsTab uid={user.id} navigation={navigation} />
        )
      ) : null}
    </ScrollView>
  );
};

export default User;
