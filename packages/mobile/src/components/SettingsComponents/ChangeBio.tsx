import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useMeStore, useSettingsStore } from "../../store";
import TypeWriter from "react-native-typewriter";
import { styles } from "../../styles";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import { COLORS } from "../../constants";
import { trpc } from "../../utils/trpc";
import { onImpact } from "../../utils";
import Ripple from "../ProgressIndicators/Ripple";
import Message from "../Message/Message";

const ChangeBio = () => {
  const { me } = useMeStore();
  const [form, setForm] = React.useState({
    bio: "",
    error: "",
    message: "",
    height: 40,
  });
  const { settings } = useSettingsStore();
  const { mutateAsync: mutateUpdateBio, isLoading } =
    trpc.profile.authProfile.useMutation();
  React.useEffect(() => {
    if (!!me) {
      setForm((state) => ({ ...state, bio: me.bio || "" }));
    }
  }, [me]);

  const update = () => {
    if (settings.haptics) {
      onImpact();
    }
  };

  return (
    <View style={{ maxWidth: 500, paddingHorizontal: 10, width: "100%" }}>
      <TypeWriter
        style={[styles.p, { fontSize: 14, marginBottom: 4 }]}
        typing={1}
        maxDelay={-50}
      >
        Update biography
      </TypeWriter>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <CustomTextInput
          keyboardType={"default"}
          placeholder={`Don't be shy about your bio...`}
          containerStyles={{
            paddingHorizontal: 0,
            marginTop: 0,
            flex: 1,
            borderRadius: 0,
          }}
          multiline
          inputStyle={{
            width: "100%",
            fontSize: 16,
            padding: 5,
            maxHeight: 100,
          }}
          text={form.bio}
          onContentSizeChange={(e) => {
            e.persist();
            setForm((state) => ({
              ...state,
              height: e.nativeEvent?.contentSize?.height + 20 ?? form.height,
            }));
          }}
          onChangeText={(text) => setForm((state) => ({ ...state, bio: text }))}
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
              marginTop: 0,
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
      {!!form.message ? <Message error={false} message={form.message} /> : null}
    </View>
  );
};

export default ChangeBio;
