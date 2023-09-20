import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import { AppNavProps } from "../../../params";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { APP_NAME, COLORS, FONTS, profile } from "../../../constants";
import { usePlatform } from "../../../hooks";
import CustomTextInput from "../../../components/CustomTextInput/CustomTextInput";
import { styles } from "../../../styles";
import { CheckBox } from "react-native-btr";
import Indeterminate from "../../../components/ProgressIndicators/Indeterminate";
import { useLocationStore, useMeStore } from "../../../store";
import { trpc } from "../../../utils/trpc";

const Edit: React.FunctionComponent<AppNavProps<"Edit">> = ({
  navigation,
  route,
}) => {
  const { data: tweet, isLoading: fetching } = trpc.tweet.tweet.useQuery({
    id: route.params.id,
  });

  const { mutateAsync: mutateEditTweet, isLoading: editing } =
    trpc.tweet.edit.useMutation();
  const { os } = usePlatform();
  const { me } = useMeStore();
  const { location } = useLocationStore();
  const [{ height, ...form }, setForm] = React.useState({
    tweet: "",
    height: 40,
    enablePolls: false,
    polls: [
      { id: 0, text: "" },
      { id: 1, text: "" },
    ],
  });

  React.useEffect(() => {
    if (tweet?.tweet) {
      setForm((state) => ({
        ...state,
        enablePolls: !!tweet.tweet?.polls.length,
        tweet: tweet.tweet?.text ?? "",
        polls: tweet.tweet?.polls.length
          ? tweet.tweet.polls.map((p, i) => ({
              id: i,
              text: p.text,
            }))
          : form.polls,
      }));
    }
    if (tweet?.error) {
      Alert.alert(
        APP_NAME,
        tweet.error,
        [
          {
            style: "default",
            text: "OK",
          },
        ],
        { cancelable: false }
      );
    }
  }, [tweet]);

  const save = () => {
    if (!!!location?.coords) return;
    mutateEditTweet({
      polls: form.enablePolls ? form.polls : [],
      text: form.tweet,
      cords: {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      },
      id: route.params.id,
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
        setForm({
          tweet: "",
          height: 40,
          enablePolls: false,
          polls: [
            { id: 0, text: "" },
            { id: 1, text: "" },
          ],
        });
        navigation.replace("Feed");
      }
    });
  };

  const removePollField = () => {
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
          label={os === "ios" ? "Feed" : ""}
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  if (fetching) return <Text>Fetching...</Text>;

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
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
            <Image
              source={{
                uri: Image.resolveAssetSource(profile).uri,
              }}
              style={{
                width: 50,
                height: 50,
                resizeMode: "contain",
                marginRight: 5,
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
              text={form.tweet}
              onContentSizeChange={(e) =>
                setForm((state) => ({
                  ...state,
                  height: e.nativeEvent?.contentSize?.height ?? height,
                }))
              }
              onChangeText={(tweet) =>
                setForm((state) => ({ ...state, tweet }))
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
              onPress={() =>
                setForm((state) => ({
                  ...state,
                  enablePolls: !form.enablePolls,
                }))
              }
            />
            <Text style={[styles.p, { fontSize: 20, marginLeft: 10 }]}>
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
                    setForm((state) => {
                      return {
                        ...state,
                        polls: form.polls.map((p) => {
                          if (p.id === poll.id) {
                            return { ...p, text };
                          } else {
                            return p;
                          }
                        }),
                      };
                    })
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
                  <Text style={[styles.button__text]}>ADD</Text>
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
                  <Text style={[styles.button__text]}>REMOVE</Text>
                </TouchableOpacity>
              </View>
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
                maxWidth: 200,
              },
            ]}
          >
            <Text style={[styles.button__text]}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Edit;
