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

  const { mutate, data } = trpc.user.register.useMutation();
  return (
    <View style={{ flex: 1, marginTop: 100 }}>
      <Button
        title="Say Hi"
        onPress={async () => {
          await mutate({
            email: "bob1@gmail.com",
            nickname: "bob1",
            password: "bob",
          });
        }}
      />
      <Text>{JSON.stringify({ data }, null, 2)}</Text>
    </View>
  );
};

export default Routes;
