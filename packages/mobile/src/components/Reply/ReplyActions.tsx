import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { BottomSheet } from "react-native-btr";
import { APP_NAME, COLORS } from "../../constants";
import { styles } from "../../styles";
import { onImpact } from "../../utils";
import type { Reply, User } from "@dispatch/api";
import { useMeStore, useSettingsStore } from "../../store";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { trpc } from "../../utils/trpc";
interface Props {
  reply: Reply & { creator: User };
  open: boolean;
  toggle: () => void;
}
const ReplyActions: React.FunctionComponent<Props> = ({
  open,
  toggle,
  reply,
}) => {
  const { isLoading: deleting, mutateAsync: mutateDeleteReply } =
    trpc.comment.deleteCommentReply.useMutation();
  const { mutateAsync: mutateBlockUser, isLoading: blocking } =
    trpc.blocked.block.useMutation();
  const { settings } = useSettingsStore();
  const { me } = useMeStore();

  const deleteReply = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (!!!reply) return;
    mutateDeleteReply({ id: reply.id }).then(({ error }) => {
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

  const block = () => {
    if (settings.haptics) {
      onImpact();
    }
    Alert.alert(
      APP_NAME,
      `Are you sure you want to block ${reply.creator.nickname}.`,
      [
        {
          style: "default",
          text: "OK",
          onPress: () => {
            if (settings.haptics) {
              onImpact();
            }
            mutateBlockUser({ uid: reply.userId }).then(() => {
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
          <Text style={[styles.h1, {}]}>Reply Actions</Text>
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
          activeOpacity={0.7}
          onPress={report}
          disabled={deleting || blocking}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 16,
                color: me?.id === reply.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Report reply
          </Text>
          <Ionicons
            name="hand-left-outline"
            size={24}
            color={me?.id === reply.userId ? COLORS.darkGray : COLORS.red}
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
          onPress={deleteReply}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 16,
                color: me?.id !== reply.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Delete reply
          </Text>
          <MaterialIcons
            name="delete-outline"
            size={24}
            color={me?.id !== reply.userId ? COLORS.darkGray : COLORS.red}
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
          onPress={block}
          disabled={deleting || blocking}
        >
          <Text
            style={[
              styles.h1,
              {
                fontSize: 16,
                color: me?.id === reply.userId ? COLORS.darkGray : COLORS.red,
              },
            ]}
          >
            Block user
          </Text>
          <MaterialIcons
            name="block"
            size={24}
            color={me?.id === reply.userId ? COLORS.darkGray : COLORS.red}
          />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default ReplyActions;
