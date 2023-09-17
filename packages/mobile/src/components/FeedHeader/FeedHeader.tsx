import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import React from "react";
import { COLORS, FONTS } from "../../constants";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AppParamList } from "../../params";
import * as Animatable from "react-native-animatable";
import { useMediaQuery } from "../../hooks";
interface Props {
  navigation: StackNavigationProp<AppParamList, "Feed">;
}
const FeedHeader: React.FunctionComponent<Props> = ({ navigation }) => {
  const {
    dimension: { width },
  } = useMediaQuery();
  const [headerState, setHeaderState] = React.useState({
    searchTerm: "",
    focused: false,
  });
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        paddingTop: 25,
        paddingBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate("Notifications");
          }}
          style={{
            position: "relative",
            marginHorizontal: 10,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.tertiary,
              width: 10,
              height: 10,
              borderRadius: 10,
              position: "absolute",
              zIndex: 1,
              top: 0,
              left: 0,
            }}
          />
          <Ionicons
            name="ios-notifications-outline"
            size={26}
            color={COLORS.black}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Settings");
          }}
          activeOpacity={0.7}
          style={{ marginHorizontal: 10 }}
        >
          <Ionicons name="md-settings-outline" size={26} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <Animatable.View
        animation="slideInRight"
        duration={500}
        style={{
          backgroundColor: COLORS.main,
          flexDirection: "row",
          padding: 5,
          alignItems: "center",
          marginHorizontal: 10,
          borderRadius: 5,
          paddingHorizontal: 10,
          flex: width > 600 ? 1 : 0,
          maxWidth: 500,
          marginTop: 10,
        }}
      >
        <Animatable.View
          animation={headerState.focused ? "fadeInLeft" : "fadeInRight"}
          duration={400}
        >
          <TouchableOpacity
            onPress={() => {
              if (headerState.focused) {
                setHeaderState((state) => ({ ...state, searchTerm: "" }));
                Keyboard.dismiss();
              }
            }}
            activeOpacity={0.7}
          >
            {headerState.focused ? (
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={COLORS.tertiary}
              />
            ) : (
              <Ionicons name="search-sharp" size={24} color={COLORS.tertiary} />
            )}
          </TouchableOpacity>
        </Animatable.View>
        <TextInput
          placeholder="Search Feed..."
          value={headerState.searchTerm}
          onChangeText={(text) =>
            setHeaderState((state) => ({ ...state, searchTerm: text }))
          }
          style={{
            fontSize: width > 600 ? 24 : 20,
            marginLeft: 15,
            flex: 1,
            fontFamily: FONTS.regular,
          }}
          onBlur={() => {
            setHeaderState((state) => ({ ...state, focused: false }));
          }}
          onFocus={() => {
            setHeaderState((state) => ({ ...state, focused: false }));
          }}
        />
      </Animatable.View>
    </View>
  );
};

export default FeedHeader;
