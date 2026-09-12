import { Platform } from "react-native";

// Change these values to restyle the entire app.
export const colors = {
  background: "#F8F9F7",
  surface: "#FFFFFF",
  navy: "#243F4D",
  text: "#263E4A",
  muted: "#65757B",
  faint: "#8A9699",
  line: "#E4E9E6",
  orange: "#C45C33",
  orangeSoft: "#FBEEE6",
  blue: "#356B84",
  blueSoft: "#EAF2F5",
  hero: "#E5EFF1",
  green: "#48705A",
  greenSoft: "#EDF3EB",
  sand: "#F6F1E8",
  yellow: "#E8B96C",
  white: "#FFFFFF",
  overlay: "rgba(23, 43, 52, 0.42)",
  transparent: "transparent",
  illustration: {
    sky: "#DCEAED",
    hill: "#BCCDC0",
    water: "#AACAD0",
    cream: "#FFF9EA",
    brick: "#CE8667",
    roof: "#536F76",
    foliage: "#799785",
    sun: "#E3AE6F",
  },
} as const;
export const learningColors = {
  new: {
    background: colors.orangeSoft,
    border: "#E9CCBC",
    accent: colors.orange,
    text: "#8B3E22",
  },
  completed: {
    background: colors.blueSoft,
    border: "#C7DCE5",
    accent: colors.blue,
    text: colors.blue,
  },
} as const;
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };
export const typography = {
  family: Platform.select({
    web: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    default: undefined,
  }),
  sizes: {
    caption: 12,
    small: 13,
    body: 15,
    subtitle: 18,
    title: 28,
    display: 38,
  },
};
