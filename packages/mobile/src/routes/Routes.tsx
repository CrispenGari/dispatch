import { View, Text, Button, Alert } from "react-native";
import React from "react";
import { trpc } from "../utils/trpc";
import { APP_NAME } from "../constants";

const Routes = () => {
  trpc.hello.onHi.useSubscription(undefined, {
    onData: (data) => {
      Alert.alert(APP_NAME, `${data.name} says ${data.message}.`);
    },
  });
  const { data, isFetched, isLoading } = trpc.hello.greeting.useQuery({
    name: " me",
  });
  const { mutate } = trpc.hello.hi.useMutation();
  return (
    <View style={{ flex: 1, marginTop: 100 }}>
      <Button
        title="Say Hi"
        onPress={async () => {
          await mutate({ message: "Hello", name: "bob" });
        }}
      />
      <Text>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</Text>
    </View>
  );
};

export default Routes;
