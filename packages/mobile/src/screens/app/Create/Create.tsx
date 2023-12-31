import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import type { AppNavProps } from "../../../params";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { APP_NAME, COLORS, FONTS, expires, profile } from "../../../constants";
import { useDebounce, usePlatform } from "../../../hooks";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { CheckBox } from "react-native-btr";
import Indeterminate from "../../../components/ProgressIndicators/Indeterminate";
import { useLocationStore, useMeStore, useSettingsStore } from "../../../store";
import { trpc } from "../../../utils/trpc";
import { onImpact, playTweeted } from "../../../utils";
import DropdownSelect from "react-native-input-select";
import Mentions from "../../../components/BottomSheets/Mentions";

const Create: React.FunctionComponent<AppNavProps<"Create">> = ({
  navigation,
}) => {
  const { mutateAsync: mutateCreateTweet, isLoading: tweeting } =
    trpc.tweet.create.useMutation();
  const { os } = usePlatform();
  const { me } = useMeStore();
  const { settings } = useSettingsStore();
  const { location } = useLocationStore();
  const [{ height, ...form }, setForm] = React.useState({
    text: "",
    height: 45,
    enablePolls: false,
    polls: [
      { id: 0, text: "" },
      { id: 1, text: "" },
    ],
    pollExpiresIn: expires[0].value,
    mentions: [] as string[],
  });
  const nickname = useDebounce(
    form.text.split(/\s/).pop()?.startsWith("@")
      ? form.text.split(/\s/).pop()
      : undefined,
    500
  );

  const onValueChange = (exp: string) => {
    setForm((state) => ({ ...state, pollExpiresIn: exp }));
  };

  const tweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!location?.coords) return;
    mutateCreateTweet({
      polls: form.enablePolls ? form.polls : [],
      text: form.text,
      cords: {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      },
      pollExpiresIn: form.pollExpiresIn,
      mentions: form.mentions,
    }).then((data) => {
      if (data.error) {
        Alert.alert(
          APP_NAME,
          data.error,
          [
            {
              style: "default",
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      } else {
        if (settings.sound) {
          playTweeted().then(() => {
            setForm({
              pollExpiresIn: "",
              text: "",
              height: 40,
              enablePolls: false,
              polls: [
                { id: 0, text: "" },
                { id: 1, text: "" },
              ],
              mentions: [],
            });
            navigation.replace("Feed");
          });
        } else {
          setForm({
            text: "",
            mentions: [],
            height: 40,
            enablePolls: false,
            polls: [
              { id: 0, text: "" },
              { id: 1, text: "" },
            ],
            pollExpiresIn: "",
          });
          navigation.replace("Feed");
        }
      }
    });
  };

  const removePollField = () => {
    if (settings.haptics) {
      onImpact();
    }
    // minimum of 2 polls
    if (form.polls.length === 2) return;
    setForm((state) => {
      form.polls.pop();
      return {
        ...state,
        polls: form.polls,
      };
    });
  };
  const addNewPollField = () => {
    if (settings.haptics) {
      onImpact();
    }
    // polls can not be more than 5
    if (form.polls.length === 5) return;
    setForm((state) => ({
      ...state,
      polls: [
        ...form.polls,
        {
          id: form.polls.length,
          text: "",
        },
      ],
    }));
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Create Tweet",
      headerShown: true,
      headerStyle: {
        borderBottomColor: COLORS.primary,
        borderBottomWidth: 0.5,
      },
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? "Feed" : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, settings]);

  return (
    <View
      style={{ flex: 1, alignSelf: "center", width: "100%", maxWidth: 500 }}
    >
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {!!nickname && !!nickname.replace("@", "") ? (
          <Mentions
            nickname={nickname.replace("@", "")}
            setForm={setForm as any}
          />
        ) : null}
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.main,
          }}
        >
          <View
            style={{
              padding: 5,
              maxWidth: 500,
              marginTop: 10,
              paddingTop: 0,
              width: "100%",
            }}
          >
            {tweeting ? (
              <Indeterminate
                color={COLORS.tertiary}
                width={500}
                style={{ width: "100%" }}
              />
            ) : null}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={{
                  uri: Image.resolveAssetSource(profile).uri,
                }}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  marginRight: 5,
                  borderRadius: 50,
                }}
              />
              <CustomTextInput
                containerStyles={{
                  borderColor: COLORS.secondary,
                  flex: 1,
                }}
                placeholder={`Tweet news ${me?.nickname}...`}
                inputStyle={{ height, maxHeight: 300 }}
                multiline
                text={form.text}
                onContentSizeChange={(e) => {
                  e.persist();
                  setForm((state) => ({
                    ...state,
                    height: e.nativeEvent?.contentSize?.height + 20 ?? height,
                  }));
                }}
                onChangeText={(tweet) =>
                  setForm((state) => ({ ...state, text: tweet }))
                }
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                marginVertical: 10,
              }}
            >
              <CheckBox
                checked={form.enablePolls}
                color={COLORS.primary}
                disabled={false}
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  setForm((state) => ({
                    ...state,
                    enablePolls: !form.enablePolls,
                  }));
                }}
              />
              <Text style={[styles.p, { fontSize: 16, marginLeft: 10 }]}>
                {form.enablePolls ? "Disable Polls" : "Enable Polls"}
              </Text>
            </View>

            {form.enablePolls ? (
              <View style={{ marginVertical: 10 }}>
                {form.polls.map((poll) => (
                  <CustomTextInput
                    key={poll.id}
                    text={poll.text}
                    placeholder={`Poll Text ${poll.id + 1}...`}
                    onChangeText={(text) =>
                      setForm((state) => ({
                        ...state,
                        polls: form.polls.map((p) =>
                          p.id === poll.id ? { ...p, text } : p
                        ),
                      }))
                    }
                    containerStyles={{ borderWidth: 0, borderBottomWidth: 1 }}
                  />
                ))}
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={addNewPollField}
                    disabled={tweeting}
                    style={[
                      styles.button,
                      {
                        backgroundColor: COLORS.primary,
                        padding: 5,
                        borderRadius: 5,
                        alignSelf: "flex-start",
                        marginTop: 10,
                        maxWidth: 100,
                        marginRight: 10,
                      },
                    ]}
                  >
                    <Text style={[styles.button__text]}>ADD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={removePollField}
                    disabled={tweeting}
                    style={[
                      styles.button,
                      {
                        backgroundColor: COLORS.tertiary,
                        padding: 5,
                        borderRadius: 5,
                        alignSelf: "flex-start",
                        marginTop: 10,
                        maxWidth: 100,
                      },
                    ]}
                  >
                    <Text style={[styles.button__text]}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
                <DropdownSelect
                  placeholder="Change Poll Expiry"
                  options={expires}
                  optionLabel={"name"}
                  optionValue={"value"}
                  selectedValue={form.pollExpiresIn}
                  isMultiple={false}
                  helperText="Set the expiry time for your polls."
                  dropdownContainerStyle={{
                    maxWidth: 500,
                    marginTop: 10,
                    flex: 1,
                    padding: 0,
                    backgroundColor: COLORS.main,
                    marginBottom: 0,
                  }}
                  dropdownIconStyle={{ top: 5, right: 15 }}
                  dropdownStyle={{
                    borderWidth: 0,
                    borderBottomWidth: 1,
                    paddingVertical: 0,
                    paddingHorizontal: 20,
                    minHeight: 30,
                    flex: 1,
                    maxWidth: 500,
                    borderColor: COLORS.primary,
                    borderRadius: 0,
                    backgroundColor: COLORS.main,
                  }}
                  selectedItemStyle={{
                    color: COLORS.black,
                    fontFamily: FONTS.regular,
                    fontSize: 16,
                  }}
                  placeholderStyle={{
                    fontFamily: FONTS.regular,
                    fontSize: 16,
                  }}
                  onValueChange={onValueChange}
                  labelStyle={{
                    fontFamily: FONTS.regularBold,
                    fontSize: 16,
                  }}
                  primaryColor={COLORS.primary}
                  dropdownHelperTextStyle={{
                    color: COLORS.black,
                    fontFamily: FONTS.regular,
                    fontSize: 15,
                  }}
                  modalOptionsContainerStyle={{
                    padding: 10,
                    backgroundColor: COLORS.main,
                  }}
                  checkboxComponentStyles={{
                    checkboxSize: 10,
                    checkboxStyle: {
                      backgroundColor: COLORS.primary,
                      borderRadius: 10,
                      padding: 5,
                      borderColor: COLORS.tertiary,
                    },
                    checkboxLabelStyle: {
                      color: COLORS.black,
                      fontSize: 16,
                      fontFamily: FONTS.regular,
                    },
                  }}
                />
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={tweet}
              disabled={tweeting}
              style={[
                styles.button,
                {
                  backgroundColor: COLORS.primary,
                  padding: 10,
                  borderRadius: 5,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  maxWidth: 100,
                  paddingHorizontal: 5,
                },
              ]}
            >
              <Text style={[styles.button__text, { fontSize: 16 }]}>TWEET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Create;
