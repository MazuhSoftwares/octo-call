import { createTheme } from "@mui/material";

export const DARK_COLORS = {
  foreground: "#161929", // not so dark
  middleground: "#08090F", // reasonable dark
  background: "#000", // very dark
  foregroundBorder: "#31385C", // between gray and blue
  negative: "#E41C51", // red
  text: "#D9D9D9", // white
  primary: "#124BBF", // blue
} as const;

export const darkTheme = createTheme({
  typography: {
    // fontFamily: ["Montserrat"].join(","),
    fontSize: 16,
    h1: {
      fontSize: 24,
      fontWeight: "700",
    },
    h2: {
      fontSize: 24,
    },
    button: {
      textTransform: "none",
      fontWeight: "500",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 32,
          borderRadius: 8,
          border: "1px solid",
          borderColor: DARK_COLORS.foregroundBorder,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlinedSecondary: {
          background: DARK_COLORS.foreground,
          border: "1px solid",
          borderColor: DARK_COLORS.foregroundBorder,
        },
      },
    },
  },
  palette: {
    mode: "dark",
    background: {
      default: DARK_COLORS.background,
      paper: DARK_COLORS.middleground,
    },
    text: {
      primary: DARK_COLORS.text,
    },
    primary: {
      main: DARK_COLORS.primary,
    },
    secondary: {
      main: DARK_COLORS.text,
    },
    error: {
      main: DARK_COLORS.negative,
    },
  },
} as const);
