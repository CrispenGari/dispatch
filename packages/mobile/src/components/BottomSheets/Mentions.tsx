import { View, Text, Keyboard } from "react-native";
import React from "react";
import { useSettingsStore } from "../../store";
import { BottomSheet } from "react-native-btr";
import { COLORS } from "../../constants";
import { styles } from "../../styles";
import { onImpact } from "../../utils";
import { useMediaQuery } from "../../hooks";
import { trpc } from "../../utils/trpc";
import { FlatList } from "react-native-gesture-handler";
import Mention from "../User/Mention";
import type { User } from "@dispatch/api";
import type {
  CommentFormType,
  EditTweetFormType,
  ReplyFormType,
  TweetFormType,
} from "../../types";

interface Props {
  nickname: string;
  setForm: React.Dispatch<
    React.SetStateAction<
      CommentFormType | ReplyFormType | TweetFormType | EditTweetFormType
    >
  >;
}
const Mentions: React.FunctionComponent<Props> = ({ nickname, setForm }) => {
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((state) => !state);
  const { settings } = useSettingsStore();
  const { data: mentions } = trpc.user.mentions.useQuery({ nickname });
  const {
    dimension: { height },
  } = useMediaQuery();

  React.useEffect(() => {
    if (!!mentions) {
      Keyboard.dismiss();
      setOpen(!!nickname && !!mentions.length);
    }
  }, [nickname, mentions]);

  const mention = (user: User) => {
    if (settings.haptics) {
      onImpact();
    }
    setForm((state) => ({
      ...state,
      text: `${state.text.replace(new RegExp(`@${nickname}$`), "")} @${
        user.nickname
      } `,
      mentions: [...state.mentions, user.nickname],
    }));
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
          height: height * 0.6,
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
          <Text style={[styles.h1, {}]}>Mentions</Text>
        </View>
        <View style={{ height: 10 }} />
        <FlatList
          data={mentions}
          keyExtractor={(mention) => mention.id}
          renderItem={({ item }) => (
            <Mention
              mention={item}
              onPress={() => {
                mention(item);
              }}
            />
          )}
        />
      </View>
    </BottomSheet>
  );
};

export default Mentions;
