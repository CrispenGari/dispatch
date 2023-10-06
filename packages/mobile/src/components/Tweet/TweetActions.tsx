import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { BottomSheet } from "react-native-btr";
import { APP_NAME, COLORS } from "../../constants";
import { styles } from "../../styles";
import { onImpact } from "../../utils";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useMeStore, useSettingsStore } from "../../store";
import { trpc } from "../../utils/trpc";
import type { Tweet, User } from "@dispatch/api";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppParamList } from "../../params";

interface Props {
  tweet: Tweet & { creator: User };
  open: boolean;
  toggle: () => void;
  from: keyof AppParamList;
  navigation: StackNavigationProp<AppParamList, "Feed" | "User" | "Tweet">;
}
const TweetActions: React.FunctionComponent<Props> = ({
  tweet,
  open,
  toggle,
  navigation,
  from,
}) => {
  const { settings } = useSettingsStore();
  const { me } = useMeStore();
  const { mutateAsync: mutateDeleteTweet, isLoading: deleting } =
    trpc.tweet.del.useMutation();
  const { mutateAsync: mutateBlockUser, isLoading: blocking } =
    trpc.blocked.block.useMutation();

  const deleteTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    mutateDeleteTweet({ id: tweet.id }).then(({ error }) => {
      if (error) {
        Alert.alert(
          APP_NAME,
          error,
          [
            {
              style: "default",
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      }
      toggle();
    });
  };
  const editTweet = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!tweet) return;
    if (me?.id === tweet.userId) {
      navigation.navigate("Edit", { id: tweet.id, from });
      toggle();
    }
  };

  const block = () => {
    if (settings.haptics) {
      onImpact();
    }
    Alert.alert(
      APP_NAME,
      `Are you sure you want to block ${tweet.creator.nickname}.`,
      [
        {
          style: "default",
          text: "OK",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            mutateBlockUser({ uid: tweet.userId }).then(() => {
              toggle();
            });
          },
        },
        {
          style: "cancel",
          text: "CANCEL",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            toggle();
          },
        },
      ],
      { cancelable: false }
    );
  };
  const report = () => {
    if (settings.haptics) {
      onImpact();
    }
    toggle();
  };

  return (
    <BottomSheet
      visible={!!open}
      onBackButtonPress={() => {
        if (settings.haptics) {
          onImpact();
        }
        toggle();
      }}
      onBackdropPress={() => {
        if (settings.haptics) {
          onImpact();
        }
        toggle();
      }}
    >
      <View
        style={{
          height: 200,
          backgroundColor: COLORS.main,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            borderRadius: 999,
            padding: 5,
            alignSelf: "center",
            top: -10,
            backgroundColor: COLORS.main,
            paddingHorizontal: 15,
            shadowOffset: { height: 2, width: 2 },
            shadowOpacity: 1,
            shadowRadius: 2,
            shadowColor: COLORS.primary,
            elevation: 1,
          }}
        >
          <Text style={[styles.h1, {}]}>Tweet Actions</Text>
        </View>
        <View style={{ height: 10 }} />
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 1,
          }}
          onPress={editTweet}
          activeOpacity={0.7}
          disabled={deleting || blocking}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 18,
                color:
                  me?.id !== tweet.userId ? COLORS.darkGray : COLORS.primary,
              },
            ]}
          >
            Edit tweet
          </Text>

          <MaterialCommunityIcons
            name="file-edit-outline"
            size={24}
            color={me?.id !== tweet.userId ? COLORS.darkGray : COLORS.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 1,
          }}
          activeOpacity={0.7}
          disabled={deleting || blocking}
          onPress={report}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 18,
                color: me?.id === tweet.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Report tweet
          </Text>
          <Ionicons
            name="hand-left-outline"
            size={24}
            color={me?.id === tweet.userId ? COLORS.darkGray : COLORS.red}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 1,
          }}
          activeOpacity={0.7}
          disabled={deleting || blocking}
          onPress={deleteTweet}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 18,
                color: me?.id !== tweet.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Delete tweet
          </Text>
          <MaterialIcons
            name="delete-outline"
            size={24}
            color={me?.id !== tweet.userId ? COLORS.darkGray : COLORS.red}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 1,
          }}
          activeOpacity={0.7}
          disabled={deleting || blocking}
          onPress={block}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 18,
                color: me?.id === tweet.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Block user
          </Text>
          <MaterialIcons
            name="block"
            size={24}
            color={me?.id === tweet.userId ? COLORS.darkGray : COLORS.red}
          />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default TweetActions;
