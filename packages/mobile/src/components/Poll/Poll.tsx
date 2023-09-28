import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { COLORS } from "../../constants";
import { styles } from "../../styles";
import { type Poll as P, Vote } from "@dispatch/api";
import { trpc } from "../../utils/trpc";
import { useMeStore, useSettingsStore } from "../../store";
import React from "react";
import { onImpact } from "../../utils";

type PollType = Partial<P> & { votes: Vote[] };
interface Props {
  poll: PollType;
  creatorId: string;
  tweetId: string;
  totalVotes: number;
  showResults: boolean;
}
const Poll: React.FunctionComponent<Props> = ({
  poll,
  creatorId,
  tweetId,
  totalVotes,
  showResults,
}) => {
  const { me } = useMeStore();
  const { mutateAsync: mutateVote, isLoading: voting } =
    trpc.poll.vote.useMutation();

  const { settings } = useSettingsStore();
  const vote = () => {
    if (settings.haptics) {
      onImpact();
    }
    if (me?.id === creatorId) return;
    mutateVote({ id: poll.id || "", tweetId }).then((_res) => {});
  };
  const percentage = !!!totalVotes ? 0 : (poll.votes.length / totalVotes) * 100;
  return (
    <TouchableOpacity
      disabled={voting}
      style={{
        backgroundColor: COLORS.main,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 3,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.7}
      onPress={vote}
    >
      {showResults ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: 999,
          }}
        >
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: COLORS.primary,
                width: `${percentage}%`,
                borderRadius: 999,
              },
            ]}
          />
        </View>
      ) : null}
      <Text
        style={[styles.h1, { fontSize: 16, zIndex: 1, overflow: "visible" }]}
      >
        {poll.text}
      </Text>
      {showResults ? (
        <Text style={[styles.p, { fontSize: 14, marginLeft: 10 }]}>
          {percentage.toFixed(0)} %
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default Poll;
