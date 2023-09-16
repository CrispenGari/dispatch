import { NetInfoStateType } from "@react-native-community/netinfo";

export type NetworkType = {
  type: NetInfoStateType | null;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

export type SettingsType = {
  haptics: boolean;
  sound: boolean;
  uid: string | null;
};
export interface AuthFieldType {
  value: string;
  index: number;
  title: "email" | "nickname" | "password";
}
