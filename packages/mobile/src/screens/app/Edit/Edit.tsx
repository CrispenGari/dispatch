import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
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
import Mentions from "../../../components/BottomSheets/Mentions";
import DropdownSelect from "react-native-input-select";

const Edit: React.FunctionComponent<AppNavProps<"Edit">> = ({
  navigation,
  route,
}) => {
  const {
    data: tweet,
    isFetching: fetching,
    refetch,
  } = trpc.tweet.tweet.useQuery({
    id: route.params.id,
  });

  const { mutateAsync: mutateEditTweet, isLoading: editing } =
    trpc.tweet.edit.useMutation();
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
    mentions: [] as string[],
    pollExpiresIn: expires[0].value,
  });
  const onValueChange = (exp: string) => {
    setForm((state) => ({ ...state, pollExpiresIn: exp }));
  };

  const nickname = useDebounce(
    form.text.split(/\s/).pop()?.startsWith("@")
      ? form.text.split(/\s/).pop()
      : undefined,
    500
  );

  React.useEffect(() => {
    if (!!tweet) {
      setForm((state) => ({
        ...state,
        enablePolls: !!tweet.polls.length,
        text: tweet.text,
        polls: tweet.polls.length
          ? tweet.polls.map((p, i) => ({
              id: i,
              text: p.text,
            }))
          : form.polls,
      }));
    }
  }, [tweet]);

  const save = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!location?.coords) return;
    mutateEditTweet({
      polls: form.enablePolls ? form.polls : [],
      text: form.text,
      cords: {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      },
      id: route.params.id,
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
              text: "",
              height: 40,
              enablePolls: false,
              polls: [
                { id: 0, text: "" },
                { id: 1, text: "" },
              ],
              mentions: [],
              pollExpiresIn: expires[0].value,
            });
            navigation.replace("Feed");
          });
        } else {
          setForm({
            pollExpiresIn: expires[0].value,
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
    // polls can not be more than 5
    if (settings.haptics) {
      onImpact();
    }
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
      headerTitle: "Edit Tweet",
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
          label={os === "ios" ? route.params.from : ""}
          onPress={() => {
            if (settings.haptics) {
              onImpact();
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, route, settings]);

  if (!!!tweet)
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 30,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.h1, { textAlign: "center", fontSize: 14 }]}>
            Could't fetching the tweet.{" "}
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await refetch();
            }}
            activeOpacity={0.7}
            style={{ marginLeft: 3 }}
          >
            <Text
              style={[
                styles.h1,
                { textAlign: "center", fontSize: 14, color: COLORS.primary },
              ]}
            >
              Retry.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View
      style={{ flex: 1, alignSelf: "center", width: "100%", maxWidth: 500 }}
    >
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            shouldRasterizeIOS={true}
            refreshing={fetching}
            onRefresh={async () => {
              await refetch();
            }}
          />
        }
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
            }}
          >
            {editing ? (
              <Indeterminate
                color={COLORS.tertiary}
                width={500}
                style={{ width: "100%" }}
              />
            ) : null}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (settings.haptics) {
                    onImpact();
                  }
                  navigation.navigate("User", {
                    id: me?.id || "",
                    from: "Edit",
                  });
                }}
              >
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
              </TouchableOpacity>

              <CustomTextInput
                containerStyles={{
                  borderColor: COLORS.secondary,
                  flex: 1,
                }}
                placeholder={`Tweet news ${me?.nickname}...`}
                inputStyle={{ height, maxHeight: 300, fontSize: 16 }}
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
                    containerStyles={{ borderWidth: 0, borderBottomWidth: 1 }}
                    onChangeText={(text) =>
                      setForm((state) => ({
                        ...state,
                        polls: form.polls.map((p) =>
                          p.id === poll.id ? { ...p, text } : p
                        ),
                      }))
                    }
                  />
                ))}
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={addNewPollField}
                    disabled={editing}
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
                    <Text style={[styles.button__text, { fontSize: 15 }]}>
                      ADD
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={removePollField}
                    disabled={editing}
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
                    <Text style={[styles.button__text, { fontSize: 15 }]}>
                      REMOVE
                    </Text>
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
              onPress={save}
              disabled={editing}
              style={[
                styles.button,
                {
                  backgroundColor: COLORS.primary,
                  padding: 10,
                  borderRadius: 5,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  maxWidth: 100,
                },
              ]}
            >
              <Text style={[styles.button__text, { fontSize: 15 }]}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Edit;
