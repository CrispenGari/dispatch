import { View, Text, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import TypeWriter from "react-native-typewriter";
import Divider from "../../../components/Divider/Divider";
import { logo, COLORS } from "../../../constants";
import { styles } from "../../../styles";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import Message from "../../../components/Message/Message";
import { AuthNavProps } from "../../../params";
import Ripple from "../../../components/ProgressIndicators/Ripple";

const Login: React.FunctionComponent<AuthNavProps<"Login">> = ({
  navigation,
}) => {
  const [{ emailOrNickname, password, error }, setForm] = React.useState({
    emailOrNickname: "",
    password: "",
    error: "",
  });

  const login = () => {
    console.log({ password, error, emailOrNickname });
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
            Hello dispatch user👋, Welcome back.
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
          <Divider color={COLORS.black} title="Have a dispatch account?" />

          <CustomTextInput
            keyboardType={"default"}
            placeholder={"Email or Nickname"}
            inputStyle={{
              width: "100%",
              fontSize: 20,
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
            text={emailOrNickname}
            onChangeText={(text) =>
              setForm((state) => ({ ...state, emailOrNickname: text }))
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
            onSubmitEditing={login}
          />

          {error ? (
            <Message error={true} type="secondary" message={error} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={false}
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
              {"Forgot Password?"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={login}
            disabled={false}
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
                  marginRight: 10,
                },
              ]}
            >
              LOGIN
            </Text>
            <Ripple color={COLORS.tertiary} size={5} />
          </TouchableOpacity>
          <Divider color={COLORS.black} title="New user to dispatch?" />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Register")}
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
            <Text style={[styles.button__text]}>REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Login;
