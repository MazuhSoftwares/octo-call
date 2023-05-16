import { createTheme } from "@mui/material";

export const SIZES = Object.freeze({
  mainPopupWidth: 700,
});

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
      borderRadius: 8,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: 32,
        },
      },
    },
  },
  palette: {
    mode: "dark",
    text: {
      primary: "#D9D9D9",
    },
    background: {
      default: "rgba(0, 0, 0, 0.8)",
      paper: "#08090F",
    },
    primary: {
      main: "#124BBF",
    },
    secondary: {
      main: "#0D378C",
    },
    error: {
      main: "#E41C51",
    },
  },
});
