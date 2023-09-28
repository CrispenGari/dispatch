import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { APP_NAME, COLORS, FONTS, KEYS, logo } from "../../../constants";
import { styles } from "../../../styles";
import { AuthNavProps } from "../../../params";
import { useMediaQuery } from "../../../hooks";
import { BottomSheet } from "react-native-btr";
import TypeWriter from "react-native-typewriter";
import Footer from "../../../components/Footer/Footer";
import { trpc } from "../../../utils/trpc";
import Loading from "../../../components/Loading/Loading";
import { useMeStore, useSettingsStore } from "../../../store";
import { SettingsType } from "../../../types";
import { onImpact, retrieve, store } from "../../../utils";

const messages: Array<string> = [
  "Hello 👋, amazing having you on dispatch.",
  "Share news and updates with local people in your location radius.",
  "Share and comment on other contributors updates so that the city will be updated with the local and relevant news.",
  "⌚ Check time-to-time updates and in your location radius.",
];

const Landing: React.FunctionComponent<AuthNavProps<"Landing">> = ({
  navigation,
}) => {
  const { isFetching: fetching, data: me } = trpc.user.me.useQuery();
  const { setMe } = useMeStore();
  const { setSettings, settings } = useSettingsStore();
  const [open, setOpen] = React.useState(false);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const {
    dimension: { height },
  } = useMediaQuery();
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (messageIndex >= messages.length - 1) {
        setMessageIndex(0);
      } else {
        setMessageIndex((state) => state + 1);
      }
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [messageIndex]);
  React.useEffect(() => {
    if (!!me) {
      setMe(me);
    } else {
      setMe(null);
    }
  }, [me]);
  const toggle = () => setOpen((state) => !state);

  if (fetching) return <Loading />;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 0.6, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={{
            uri: Image.resolveAssetSource(logo).uri,
          }}
          style={{
            width: 150,
            height: 150,
            marginBottom: 10,
            resizeMode: "contain",
          }}
        />
        <TypeWriter
          style={[
            styles.h1,
            {
              textAlign: "center",
              height: 100,
              fontSize: 20,
              alignSelf: "center",
              width: "80%",
            },
          ]}
          typing={1}
          maxDelay={-50}
        >
          {messages[messageIndex]}
        </TypeWriter>
      </View>
      <View
        style={{
          flex: 0.4,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: 500,
          padding: 10,
          alignSelf: "center",
        }}
      >
        <TouchableOpacity
          onPress={async () => {
            if (settings.haptics) {
              onImpact();
            }
            const s = await retrieve(KEYS.APP_SETTINGS);
            if (!!!s) {
              await store(KEYS.APP_SETTINGS, JSON.stringify(settings));
            } else {
              setSettings(JSON.parse(s) as SettingsType);
              await store(KEYS.APP_SETTINGS, JSON.stringify(s));
            }

            toggle();
          }}
          activeOpacity={0.7}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 10,
              borderRadius: 5,
              marginTop: 10,
              maxWidth: 200,
            },
          ]}
        >
          <Text style={[styles.button__text, { color: COLORS.black }]}>
            GET STARTED
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={!!open}
        onBackButtonPress={toggle}
        onBackdropPress={toggle}
      >
        <View
          style={{
            height: height / 2,
            backgroundColor: COLORS.main,
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
          }}
        >
          <View
            style={{
              flex: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                maxWidth: 400,
              }}
            >
              <Text style={[styles.p, { fontFamily: FONTS.regularBold }]}>
                By using {APP_NAME} you are automatically agreeing with our
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  toggle();
                  navigation.navigate("AuthTermsOfUse", { from: "Landing" });
                }}
                activeOpacity={0.7}
                style={{}}
              >
                <Text
                  style={[
                    styles.p,
                    {
                      fontFamily: FONTS.regularBold,
                      color: COLORS.primary,
                      textDecorationStyle: "solid",
                      textDecorationColor: COLORS.primary,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Terms and Conditions
                </Text>
              </TouchableOpacity>
              <Text style={[styles.p, { fontFamily: FONTS.regularBold }]}>
                {" "}
                and you are inline with our{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  toggle();
                  navigation.navigate("AuthPrivacyPolicy", { from: "Landing" });
                }}
                activeOpacity={0.7}
                style={{}}
              >
                <Text
                  style={[
                    styles.p,
                    {
                      fontFamily: FONTS.regularBold,
                      color: COLORS.primary,
                      textDecorationStyle: "solid",
                      textDecorationColor: COLORS.primary,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <Text style={[styles.p, { fontFamily: FONTS.regularBold }]}>
                .
              </Text>
            </View>
            <Image
              source={{
                uri: Image.resolveAssetSource(logo).uri,
              }}
              style={{
                width: 100,
                height: 100,
                marginBottom: -50,
                resizeMode: "contain",
              }}
            />
          </View>
          <View
            style={{
              flex: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TypeWriter
              style={[
                styles.p,
                {
                  textAlign: "center",
                  marginBottom: 10,
                  alignSelf: "center",
                },
              ]}
              typing={1}
              maxDelay={-50}
            >
              Hi 👋, you definitely need to authenticate.
            </TypeWriter>

            <TouchableOpacity
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                toggle();
                navigation.replace("Login");
              }}
              activeOpacity={0.7}
              style={[
                styles.button,
                {
                  backgroundColor: COLORS.secondary,
                  padding: 10,
                  marginTop: 10,
                },
              ]}
            >
              <Text style={[styles.button__text]}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (settings.haptics) {
                  onImpact();
                }
                toggle();
                navigation.replace("Register");
              }}
              activeOpacity={0.7}
              style={[
                styles.button,
                {
                  backgroundColor: COLORS.primary,
                  padding: 10,
                  marginTop: 10,
                },
              ]}
            >
              <Text style={[styles.button__text]}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
      <Footer />
    </View>
  );
};

export default Landing;
