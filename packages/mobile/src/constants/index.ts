export const KEYS = {
  TOKEN_KEY: "qid:",
  APP_SETTINGS: "set:",
};
export const APP_NAME = "dispatch";
export const domain: string = "1aeb-213-172-134-7.ngrok-free.app";
export const serverBaseHttpURL: string = `https://${domain}`;
export const serverBaseWsURL: string = `wss://${domain}`;
export const clientHttpURL: string = `${serverBaseHttpURL}/api/trpc`;
export const clientWsURL: string = `${serverBaseWsURL}/api/trpc`;

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
