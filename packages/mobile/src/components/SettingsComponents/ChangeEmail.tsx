import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import TypeWriter from "react-native-typewriter";
import { styles } from "../../styles";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import { APP_NAME, COLORS, KEYS } from "../../constants";
import { trpc } from "../../utils/trpc";
import { del, onImpact, store } from "../../utils";
import Ripple from "../ProgressIndicators/Ripple";
import Message from "../Message/Message";

const ChangeEmail = () => {
  const { me, setMe } = useMeStore();
  const [form, setForm] = React.useState({
    email: "",
    error: "",
    message: "",
  });
  const { mutateAsync: mutateLogout } = trpc.auth.logout.useMutation();
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

  return (
    <View style={{ maxWidth: 500, paddingHorizontal: 10, width: "100%" }}>
      <TypeWriter
        style={[styles.p, { fontSize: 14 }]}
        typing={1}
        maxDelay={-50}
      >
        Change email
      </TypeWriter>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <CustomTextInput
          keyboardType={"email-address"}
          placeholder={"Email"}
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
          text={form.email}
          onChangeText={(text) =>
            setForm((state) => ({ ...state, email: text }))
          }
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={update}
          disabled={isLoading}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary,
              padding: 5,
              borderRadius: 0,
              maxWidth: 100,
              marginLeft: 5,
            },
          ]}
        >
          <Text
            style={[
              styles.button__text,
              {
                marginRight: isLoading ? 10 : 0,
                fontSize: 16,
              },
            ]}
          >
            UPDATE
          </Text>
          {isLoading ? <Ripple color={COLORS.tertiary} size={5} /> : null}
        </TouchableOpacity>
      </View>
      {!!form.error ? <Message error={true} message={form.error} /> : null}
      {!!form.message ? (
        <Message error={false} message={form.message} type="primary" />
      ) : null}
    </View>
  );
};

export default ChangeEmail;
