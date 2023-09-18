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

const ResetPassword: React.FunctionComponent<AuthNavProps<"ResetPassword">> = ({
  navigation,
}) => {
  const [{ confirmPassword, password, error }, setForm] = React.useState({
    confirmPassword: "",
    password: "",
    error: "",
  });

  const changePassword = () => {
    console.log({ password, error, confirmPassword });
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
          <Divider
            color={COLORS.black}
            title="Changing your account password?"
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
            onSubmitEditing={changePassword}
          />
          {error ? (
            <Message error={true} type="secondary" message={error} />
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={changePassword}
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
              CHANGE PASSWORD
            </Text>
            <Ripple color={COLORS.tertiary} size={5} />
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="I remember my account credentials?"
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

export default ResetPassword;
