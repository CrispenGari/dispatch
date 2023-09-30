import {
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  SafeAreaView,
  Image,
} from "react-native";
import React from "react";
import { COLORS, FONTS, profile } from "../../constants";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import type { AppParamList } from "../../params";
import * as Animatable from "react-native-animatable";
import { useMediaQuery } from "../../hooks";
import { useMeStore, useSettingsStore } from "../../store";
import { onImpact } from "../../utils";
import { trpc } from "../../utils/trpc";

interface Props {
  navigation: StackNavigationProp<AppParamList, "Feed">;
}
const FeedHeader: React.FunctionComponent<Props> = ({ navigation }) => {
  const {
    dimension: { width },
  } = useMediaQuery();
  const { me } = useMeStore();
  const { settings } = useSettingsStore();

  const { data: notifications, refetch } =
    trpc.notification.notifications.useQuery({
      category: "general",
    });
  trpc.notification.onDelete.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );

  const [headerState, setHeaderState] = React.useState({
    searchTerm: "",
    focused: false,
    notification: false,
  });

  React.useEffect(() => {
    if (!!notifications) {
      setHeaderState((state) => ({
        ...state,
        notification: !!notifications.filter(({ read }) => read === false)
          .length,
      }));
    }
  }, [notifications]);

  return (
    <View
      style={{
        backgroundColor: COLORS.main,
        paddingTop: 25,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.primary,
      }}
    >
      <SafeAreaView
        style={{ flexDirection: "row", justifyContent: "space-between" }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ marginLeft: 10 }}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.navigate("User", { id: me?.id ?? "", from: "Feed" });
          }}
        >
          <Image
            style={{
              width: 40,
              height: 40,
              resizeMode: "contain",

              borderRadius: 40,
            }}
            source={{ uri: Image.resolveAssetSource(profile).uri }}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                navigation.navigate("Notifications");
              }}
              style={{
                position: "relative",
                marginHorizontal: 10,
              }}
            >
              {headerState.notification ? (
                <View
                  style={{
                    backgroundColor: COLORS.tertiary,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    position: "absolute",
                    zIndex: 1,
                    top: 0,
                    left: 0,
                  }}
                />
              ) : null}
              <Ionicons
                name="ios-notifications-outline"
                size={26}
                color={COLORS.black}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                navigation.navigate("Settings");
              }}
              activeOpacity={0.7}
              style={{ marginHorizontal: 10 }}
            >
              <Ionicons
                name="md-settings-outline"
                size={26}
                color={COLORS.black}
              />
            </TouchableOpacity>
          </View>

          <Animatable.View
            animation="slideInRight"
            duration={500}
            style={{
              backgroundColor: COLORS.main,
              flexDirection: "row",
              padding: 5,
              alignItems: "center",
              marginHorizontal: 10,
              borderRadius: 5,
              paddingHorizontal: 10,
              maxWidth: 500,
              marginTop: 10,
              borderWidth: 0.5,
              borderColor: COLORS.primary,
            }}
          >
            <Animatable.View
              animation={headerState.focused ? "fadeInLeft" : "fadeInRight"}
              duration={400}
            >
              <TouchableOpacity
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  if (headerState.focused) {
                    setHeaderState((state) => ({ ...state, searchTerm: "" }));
                    Keyboard.dismiss();
                  }
                }}
                activeOpacity={0.7}
              >
                {headerState.focused ? (
                  <Ionicons
                    name="arrow-back-outline"
                    size={20}
                    color={COLORS.tertiary}
                  />
                ) : (
                  <Ionicons
                    name="search-sharp"
                    size={20}
                    color={COLORS.tertiary}
                  />
                )}
              </TouchableOpacity>
            </Animatable.View>
            <TextInput
              placeholder="Search Feed..."
              value={headerState.searchTerm}
              onChangeText={(text) =>
                setHeaderState((state) => ({ ...state, searchTerm: text }))
              }
              style={{
                fontSize: width > 600 ? 18 : 16,
                marginLeft: 15,
                flex: 1,
                fontFamily: FONTS.regular,
              }}
              onBlur={() => {
                setHeaderState((state) => ({ ...state, focused: false }));
              }}
              onFocus={() => {
                setHeaderState((state) => ({ ...state, focused: false }));
              }}
            />
          </Animatable.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default FeedHeader;
