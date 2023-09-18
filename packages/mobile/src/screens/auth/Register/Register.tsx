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

const Register: React.FunctionComponent<AuthNavProps<"Register">> = ({
  navigation,
}) => {
  const { mutateAsync: mutateRegister, isLoading: registering } =
    trpc.auth.register.useMutation();
  const { mutateAsync: mutateResendVerificationEmail, isLoading: resending } =
    trpc.auth.resendVerificationEmail.useMutation();

  const [
    { email, nickname, password, confirmPassword, error, message },
    setForm,
  ] = React.useState({
    email: "",
    password: "",
    nickname: "",
    confirmPassword: "",
    error: "",
    message: "",
  });

  const register = () => {
    mutateRegister({ email, nickname, password, confirmPassword }).then(
      async (res) => {
        if (res.error) {
          setForm((state) => ({
            ...state,
            error: res.error,
            message: "",
            password: "",
            confirmPassword: "",
          }));
        }
        if (res.jwt) {
          setForm((state) => ({
            ...state,
            error: "",
            message:
              "The verification email has been sent. Check to your mail box to verify your email by clicking the link.",
          }));
          await store(KEYS.TOKEN_KEY, res.jwt);
        }
      }
    );
  };
  const resendEmail = () => {};
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
            flex: 0.5,
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
            Hello new user👋, Welcome to dispatch.
          </TypeWriter>
        </View>

        <View
          style={{
            flex: 0.5,
            width: "100%",
            maxWidth: 500,
            alignSelf: "center",
          }}
        >
          <Divider color={COLORS.black} title="New user on dispatch?" />
          <CustomTextInput
            keyboardType={"email-address"}
            placeholder={"Email address"}
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
          />

          <CustomTextInput
            keyboardType={"default"}
            placeholder={"Nickname"}
            inputStyle={{
              width: "100%",
              fontSize: 20,
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
            text={nickname}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, nickname: text }))
            }
          />
          <CustomTextInput
            keyboardType={"default"}
            placeholder={"Password"}
            inputStyle={{
              width: "100%",
              fontSize: 20,
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
            secureTextEntry={true}
            text={password}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, password: text }))
            }
          />
          <CustomTextInput
            keyboardType={"default"}
            placeholder={"Confirm Password"}
            inputStyle={{
              width: "100%",
              fontSize: 20,
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
            secureTextEntry={true}
            text={confirmPassword}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, confirmPassword: text }))
            }
            onSubmitEditing={register}
          />
          {message ? (
            <Message error={false} type="primary" message={message} />
          ) : null}
          {error ? (
            <Message error={true} type="secondary" message={error} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={resendEmail}
            disabled={resending || registering}
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
              {"I didn't receive any email!"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={register}
            disabled={resending || registering}
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
                  marginRight: resending || registering ? 10 : 0,
                },
              ]}
            >
              REGISTER
            </Text>
            {resending || registering ? (
              <Ripple color={COLORS.tertiary} size={5} />
            ) : null}
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="Already have an dispatch account?"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Login")}
            disabled={resending || registering}
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

export default Register;
