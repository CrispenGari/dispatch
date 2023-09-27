import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import TypeWriter from "react-native-typewriter";
import Divider from "../../../components/Divider/Divider";
import { logo, COLORS, KEYS, APP_NAME } from "../../../constants";
import { styles } from "../../../styles";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import Message from "../../../components/Message/Message";
import { AuthNavProps } from "../../../params";
import Ripple from "../../../components/ProgressIndicators/Ripple";
import { trpc } from "../../../utils/trpc";
import { onImpact, store } from "../../../utils";
import { useSettingsStore } from "../../../store";

const ResetPassword: React.FunctionComponent<AuthNavProps<"ResetPassword">> = ({
  navigation,
  route,
}) => {
  const { mutateAsync: mutateChangePassword, isLoading: changing } =
    trpc.auth.changePassword.useMutation();
  const [{ confirmPassword, password, error }, setForm] = React.useState({
    confirmPassword: "",
    password: "",
    error: "",
  });
  const { settings } = useSettingsStore();

  const changePassword = () => {
    if (settings.haptics) {
      onImpact();
    }
    mutateChangePassword({
      confirmPassword,
      password,
      token: route.params.token,
    }).then(async (res) => {
      if (res.error) {
        setForm((state) => ({
          ...state,
          password: "",
          confirmPassword: "",
          error: res.error,
        }));
      }
      if (res.jwt) {
        await store(KEYS.TOKEN_KEY, res.jwt);
        setForm((state) => ({
          ...state,
          error: "",
        }));

        Alert.alert(
          APP_NAME,
          "Your password has been changed successfully. Please login with your new credentials",
          [
            {
              style: "default",
              text: "OK",
              onPress: () => {
                if (settings.haptics) {
                  onImpact();
                }
                navigation.replace("Login");
              },
            },
          ],
          { cancelable: false }
        );
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
            disabled={changing}
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
                  marginRight: changing ? 10 : 0,
                },
              ]}
            >
              CHANGE PASSWORD
            </Text>

            {changing ? <Ripple color={COLORS.tertiary} size={5} /> : null}
          </TouchableOpacity>
          <Divider
            color={COLORS.black}
            title="I remember my account credentials?"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (settings.haptics) {
                onImpact();
              }
              navigation.navigate("Login");
            }}
            disabled={changing}
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
