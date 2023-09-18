import { View, Text, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import TypeWriter from "react-native-typewriter";
import Divider from "../../../components/Divider/Divider";
import { logo, COLORS, KEYS } from "../../../constants";
import { styles } from "../../../styles";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import Message from "../../../components/Message/Message";
import { AuthNavProps } from "../../../params";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { trpc } from "../../../utils/trpc";
import { store } from "../../../utils";

const ForgotPassword: React.FunctionComponent<
  AuthNavProps<"ForgotPassword">
> = ({ navigation }) => {
  const { isLoading: sending, mutateAsync: mutateSendForgotPasswordLink } =
    trpc.auth.sendForgotPasswordLink.useMutation();
  const { isLoading: resending, mutateAsync: mutateReSendForgotPasswordLink } =
    trpc.auth.resendForgotPasswordLink.useMutation();
  const [{ email, error, message }, setForm] = React.useState({
    email: "",
    error: "",
    message: "",
  });
  const sendResetPasswordLink = () => {
    mutateSendForgotPasswordLink({ email }).then(async (res) => {
      if (res.error) {
        setForm((state) => ({ ...state, error: res.error, message: "" }));
      }
      if (res.jwt) {
        setForm((state) => ({
          ...state,
          error: "",
          message:
            "The reset password link has been sent to your email. Check your emails.",
        }));
        await store(KEYS.TOKEN_KEY, res.jwt);
      }
    });
  };

  const resendResetPasswordLink = () => {
    mutateReSendForgotPasswordLink({ email }).then(async (res) => {
      if (res.error) {
        setForm((state) => ({ ...state, error: res.error, message: "" }));
      }
      if (res.jwt) {
        setForm((state) => ({
          ...state,
          error: "",
          message:
            "The reset password link has been res-sent to your email. Check your emails.",
        }));
        await store(KEYS.TOKEN_KEY, res.jwt);
      }
    });
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View
        style={{
          flex: 1,
          padding: 10,
        }}
      >
        <View
          style={{
            flex: 0.7,
            justifyContent: "center",
            alignItems: "center",
          }}
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
          <TypeWriter
            style={[
              styles.p,
              {
                textAlign: "center",
                height: 100,
              },
            ]}
            typing={1}
            maxDelay={-50}
          >
            Hello dispatch user👋, It seems like you forgot your password.
          </TypeWriter>
        </View>

        <View
          style={{
            flex: 0.3,
            width: "100%",
            maxWidth: 500,
            alignSelf: "center",
          }}
        >
          <Divider
            color={COLORS.black}
            title="I forgot my dispatch account password?"
          />

          <CustomTextInput
            keyboardType={"email-address"}
            placeholder={"Dispatch account Email"}
            inputStyle={{
              width: "100%",
              fontSize: 20,
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
            text={email}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, email: text }))
            }
            onSubmitEditing={sendResetPasswordLink}
          />

          {message ? (
            <Message error={false} type="primary" message={message} />
          ) : null}
          {error ? (
            <Message error={true} type="secondary" message={error} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={resendResetPasswordLink}
            disabled={resending || sending}
            style={{
              alignSelf: "flex-end",
              marginVertical: 5,
            }}
          >
            <Text
              style={[
                styles.p,
                {
                  textDecorationStyle: "solid",
                  textDecorationLine: "underline",
                },
              ]}
            >
              {"Did not receive any email?"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={sendResetPasswordLink}
            disabled={resending || sending}
            style={[
              styles.button,
              {
                backgroundColor: COLORS.primary,
                padding: 10,
                borderRadius: 5,
                alignSelf: "flex-start",
                marginTop: 10,
                maxWidth: 200,
              },
            ]}
          >
            <Text
              style={[
                styles.button__text,
                {
                  marginRight: sending || resending ? 10 : 0,
                },
              ]}
            >
              REQUEST LINK
            </Text>

            {sending || resending ? (
              <Ripple color={COLORS.tertiary} size={5} />
            ) : null}
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="I remember my dispatch account password?"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={resending || sending}
            onPress={() => navigation.navigate("Login")}
            style={[
              styles.button,
              {
                backgroundColor: COLORS.secondary,
                padding: 10,
                borderRadius: 5,
                alignSelf: "flex-start",
                marginTop: 10,
                maxWidth: 200,
              },
            ]}
          >
            <Text style={[styles.button__text]}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ForgotPassword;
