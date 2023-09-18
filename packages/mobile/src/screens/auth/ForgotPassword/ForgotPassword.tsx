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

const ForgotPassword: React.FunctionComponent<
  AuthNavProps<"ForgotPassword">
> = ({ navigation }) => {
  const [{ email, error }, setForm] = React.useState({
    email: "",

    error: "",
  });

  const sendResetPasswordLink = () => {
    console.log({ error, email });
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
              {"Did not receive any email?"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={sendResetPasswordLink}
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
              REQUEST LINK
            </Text>
            <Ripple color={COLORS.tertiary} size={5} />
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="I remember my dispatch account password?"
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

export default ForgotPassword;
