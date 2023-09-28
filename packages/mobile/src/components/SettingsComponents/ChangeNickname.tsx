import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import TypeWriter from "react-native-typewriter";
import { styles } from "../../styles";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import { COLORS, KEYS } from "../../constants";
import { trpc } from "../../utils/trpc";
import { onImpact, store } from "../../utils";
import Ripple from "../ProgressIndicators/Ripple";
import Message from "../Message/Message";

const ChangeNickname = () => {
  const { me } = useMeStore();
  const [form, setForm] = React.useState({
    nickname: "",
    error: "",
    message: "",
  });
  const { settings } = useSettingsStore();
  const { mutateAsync: mutateUpdateNickname, isLoading } =
    trpc.user.updateNickname.useMutation();
  React.useEffect(() => {
    if (!!me) {
      setForm((state) => ({ ...state, nickname: me.nickname }));
    }
  }, [me]);

  React.useEffect(() => {
    if (!!form.error || !!form.message) {
      const timeoutId = setTimeout(() => {
        setForm((state) => ({ ...state, error: "", message: "" }));
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [form]);

  const update = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (me?.nickname === form.nickname.trim().toLowerCase()) {
      setForm((state) => ({ ...state, error: "", message: "" }));
      return;
    }
    mutateUpdateNickname({ nickname: form.nickname }).then(async (data) => {
      if (data.error) {
        setForm((state) => ({ ...state, message: "", error: data.error }));
      }
      if (data.jwt) {
        setForm((state) => ({
          ...state,
          message: "Your nickname has been updated.",
          error: "",
        }));
        await store(KEYS.TOKEN_KEY, data.jwt);
      }
    });
  };

  return (
    <View
      style={{
        maxWidth: 500,
        paddingHorizontal: 10,
        width: "100%",
      }}
    >
      <TypeWriter
        style={[styles.p, { fontSize: 14 }]}
        typing={1}
        maxDelay={-50}
      >
        Change nickname
      </TypeWriter>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <CustomTextInput
          keyboardType={"default"}
          placeholder={"Nickname"}
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
          text={form.nickname}
          onChangeText={(text) =>
            setForm((state) => ({ ...state, nickname: text }))
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

export default ChangeNickname;
