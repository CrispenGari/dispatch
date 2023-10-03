import type { GenderType } from "../types";

export const KEYS = {
  TOKEN_KEY: "qid:",
  APP_SETTINGS: "set:",
};

export const genders: {
  value: GenderType;
  id: number;
  name: string;
}[] = [
  { id: 0, name: "Male", value: "MALE" },
  { id: 1, name: "Female", value: "FEMALE" },
  { id: 2, name: "Prefer not to say", value: "UNDEFINED" },
];

export const sorts: {
  id: number;
  value: "asc" | "desc";
  name: string;
}[] = [
  { id: 0, name: "New First", value: "desc" },
  { id: 1, name: "Old First", value: "asc" },
];
export const expires: {
  value: string;
  id: number;
  name: string;
}[] = [
  { id: 0, name: "1 minute", value: "1 m" },
  { id: 1, name: "10 minutes", value: "10 m" },
  { id: 2, name: "30 minutes", value: "30 m" },
  { id: 3, name: "1 hour", value: "3 h" }, // behind with 2h
  { id: 4, name: "12 hours", value: "12 h" },
  { id: 5, name: "1 day", value: "1 d" },
  { id: 6, name: "1 week", value: "7 d" },
  { id: 7, name: "1 month", value: "30 d" },
  { id: 8, name: "1 year", value: "365 d" },
];

export const APP_NAME = "dispatch";
export const domain: string = "1f86-213-172-134-217.ngrok-free.app";
export const serverBaseHttpURL: string = `https://${domain}`;
export const serverBaseWsURL: string = `wss://${domain}`;
export const clientHttpURL: string = `${serverBaseHttpURL}/api/trpc`;
export const clientWsURL: string = `${serverBaseWsURL}/api/trpc`;

export const relativeTimeObject = {
  future: "in %s",
  past: "%s",
  s: "now",
  m: "1m",
  mm: "%dm",
  h: "1h",
  hh: "%dh",
  d: "1d",
  dd: "%dd",
  M: "1M",
  MM: "%dM",
  y: "1y",
  yy: "%dy",
};

export const COLORS = {
  main: "#FFFFFF",
  primary: "#92B4EC",
  secondary: "#FFE69A",
  tertiary: "#FFD24C",
  white: "white",
  red: "#FF3953",
  green: "#5EBB7C",
  black: "#000000",
  gray: "#f5f5f5",
  darkGray: "gray",
  loaderGray: "#CCCCCC",
};
export const Fonts = {
  AlegreyaSansItalic: require("../../assets/fonts/AlegreyaSans-Italic.ttf"),
  AlegreyaSansRegular: require("../../assets/fonts/AlegreyaSans-Regular.ttf"),
  AlegreyaSansBold: require("../../assets/fonts/AlegreyaSans-Bold.ttf"),
  AlegreyaSansBoldItalic: require("../../assets/fonts/AlegreyaSans-BoldItalic.ttf"),
  AlegreyaSansExtraBold: require("../../assets/fonts/AlegreyaSans-ExtraBold.ttf"),
  AlegreyaSansExtraBoldItalic: require("../../assets/fonts/AlegreyaSans-ExtraBoldItalic.ttf"),
};
export const FONTS = {
  regular: "AlegreyaSansRegular",
  italic: "AlegreyaSansItalic",
  italicBold: "AlegreyaSansBoldItalic",
  regularBold: "AlegreyaSansBold",
  extraBold: "AlegreyaSansExtraBold",
  extraBoldItalic: "AlegreyaSansExtraBoldItalic",
};

export const logo = require("../../assets/logo.png");

export const profile = require("../../assets/profile.png");
