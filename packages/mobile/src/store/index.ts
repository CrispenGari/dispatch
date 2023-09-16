import { create } from "zustand";
import { NetworkType, SettingsType } from "../types";
import { User } from "@dispatch/api";

export const useNetworkStore = create<{
  network: Required<NetworkType>;
  setNetwork: (network: Required<NetworkType>) => void;
}>((set) => ({
  network: {
    isConnected: true,
    isInternetReachable: true,
    type: null,
  },
  setNetwork: (network: Required<NetworkType>) => set({ network }),
}));

export const useSettingsStore = create<{
  settings: Required<SettingsType>;
  setSettings: (settings: SettingsType) => void;
}>((set) => ({
  settings: { sound: true, haptics: true, uid: null },
  setSettings: (settings: SettingsType) => set({ settings }),
}));
export const useTokenStore = create<{
  token: string;
  setToken: (token: string) => void;
}>((set) => ({
  token: "",
  setToken: (token) => set({ token }),
}));

export const useMeStore = create<{
  me: User | null;
  setMe: (me: User | null) => void;
}>((set) => ({
  me: null,
  setMe: (me) => set({ me }),
}));
