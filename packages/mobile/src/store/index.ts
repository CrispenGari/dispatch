import { create } from "zustand";
import type { NetworkType, SettingsType } from "../types";
import type { User } from "@dispatch/api";
import * as Location from "expo-location";

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
  settings: { haptics: true, sound: true, pageLimit: 3 },
  setSettings: (settings: SettingsType) => set({ settings }),
}));

export const useLocationStore = create<{
  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
}>((set) => ({
  location: null,
  setLocation: (location: Location.LocationObject | null) => set({ location }),
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
