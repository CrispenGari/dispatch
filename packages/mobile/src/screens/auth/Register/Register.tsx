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

const Register: React.FunctionComponent<AuthNavProps<"Register">> = ({
  navigation,
}) => {
  const [{ email, nickname, password, confirmPassword, error }, setForm] =
    React.useState({
      email: "",
      password: "",
      nickname: "",
      confirmPassword: "",
      error: "",
    });

  const register = () => {
    console.log({ email, nickname, password, confirmPassword, error });
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
          {error ? (
            <Message error={true} type="secondary" message={error} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={resendEmail}
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
              {"I didn't receive any email!"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={register}
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
              REGISTER
            </Text>
            <Ripple color={COLORS.tertiary} size={5} />
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="Already have an dispatch account?"
          />
          <TouchableOpacity
            activeOpacity={0.7}
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

export default Register;
