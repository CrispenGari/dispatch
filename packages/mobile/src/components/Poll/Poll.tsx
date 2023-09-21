import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { COLORS } from "../../constants";
import { styles } from "../../styles";
import { type Poll as P, Vote } from "@dispatch/api";
import { trpc } from "../../utils/trpc";
import { useMeStore } from "../../store";
import React from "react";

type PollType = Partial<P> & { votes: Vote[] };
interface Props {
  poll: PollType;
  creatorId: string;
  tweetId: string;
  totalVotes: number;
  nPolls: number;
}
const Poll: React.FunctionComponent<Props> = ({
  poll,
  creatorId,
  tweetId,
  totalVotes,
  nPolls,
}) => {
  const { me } = useMeStore();
  const { mutateAsync: mutateVote, isLoading: voting } =
    trpc.poll.vote.useMutation();
  const vote = () => {
    if (me?.id === creatorId) return;
    mutateVote({ id: poll.id || "", tweetId }).then((res) => {
      console.log({ res });
    });
  };
  const percentage = (poll.votes.length / totalVotes) * 100;
  return (
    <TouchableOpacity
      disabled={voting}
      style={{
        backgroundColor: COLORS.main,
        borderWidth: 3,
        borderColor: COLORS.gray,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 3,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
      }}
      activeOpacity={0.7}
      onPress={vote}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: 3,
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: COLORS.primary,
              width: `${percentage}%`,
              borderRadius: 3,
            },
          ]}
        />
      </View>
      <Text
        style={[styles.h1, { fontSize: 18, zIndex: 1, overflow: "visible" }]}
      >
        {poll.text}
      </Text>
      <Text style={[styles.p, { fontSize: 16, marginLeft: 10 }]}>
        {percentage} %
      </Text>
    </TouchableOpacity>
  );
};

export default Poll;
