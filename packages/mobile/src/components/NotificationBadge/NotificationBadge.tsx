import { View } from "react-native";
import React from "react";
import { COLORS } from "../../constants";
import { useMeStore } from "../../store";
import { trpc } from "../../utils/trpc";

interface Props {
  route: {
    key: string;
    title: string;
  };
}
const NotificationBadge: React.FunctionComponent<Props> = ({ route }) => {
  const { data: notifications, refetch } = trpc.notification.all.useQuery();
  const [notification, setNotification] = React.useState(false);
  const { me } = useMeStore();

  trpc.notification.onDelete.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  trpc.notification.onNotificationRead.useSubscription(
    { uid: me?.id || "" },
    {
      onData: async (_data) => {
        await refetch();
      },
    }
  );
  React.useEffect(() => {
    if (!!notifications) {
      setNotification(
        !!notifications
          .filter((not) =>
            route.key === "all"
              ? not.category === "general"
              : not.category === "mention"
          )
          .filter(({ read }) => read === false).length
      );
    }
  }, [notifications, route]);
  if (!notification) return null;
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: COLORS.tertiary,
        top: 5,
        right: 30,
      }}
    />
  );
};

export default NotificationBadge;
