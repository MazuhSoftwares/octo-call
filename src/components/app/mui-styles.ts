import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    label: true;
  }
}

export function getThemedColor(key: keyof typeof DARK_COLORS): string {
  return DARK_COLORS[key] || "none";
}

// See: https://mui.com/material-ui/customization/breakpoints/#default-breakpoints
export const SMALL_WIDTH = 600;
export const MEDIUM_WIDTH = 900;
export const LARGE_WIDTH = 1200;
export const EXTRA_LARGE_WIDTH = 1536;

// From mere observation
export const SMALL_HEIGHT = 500;
export const MEDIUM_HEIGHT = 650;
export const LARGE_HEIGHT = 900;
export const EXTRA_LARGE_HEIGHT = 1200;

// Custom colors by our designer Xia
const DARK_COLORS = {
  foreground: "#161929", // not so dark
  middleground: "#08090F", // reasonable dark
  background: "#000", // very dark
  commonBorder: "#31385C", // between gray and blue
  inputBorder: "#6B737A", // somewhat gray, lighter than the common border
  focusBorder: "#1A73E8", // blue
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
    h3: {
      fontSize: 18,
      fontWeight: "700",
    },
    button: {
      textTransform: "none",
      fontWeight: "500",
    },
    body1: {
      fontSize: 16,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          "&.MuiTypography-label": {
            fontWeight: "bold",
            paddingBottom: 16,
          },
          "&.MuiLink-root": {
            color: DARK_COLORS.text,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 32,
          borderRadius: 8,
          border: "1px solid",
          borderColor: DARK_COLORS.commonBorder,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "standard",
        InputProps: {
          disableUnderline: true,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiInput-root": {
            borderRadius: 8,
            marginTop: 0,
          },
        },
        input: {
          borderRadius: 8,
          padding: "16px 14px",
          border: "1px solid",
          borderColor: DARK_COLORS.inputBorder,
          "&:focus": {
            borderColor: DARK_COLORS.focusBorder,
          },
        },
      },
    },
    MuiNativeSelect: {
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        select: {
          borderRadius: 8,
          border: "1px solid !important",
          borderColor: `${DARK_COLORS.inputBorder} !important`,
          padding: "16px 14px !important",
          paddingRight: "40px !important",
          "&:focus": {
            borderRadius: 8,
            borderColor: `${DARK_COLORS.focusBorder} !important`,
          },
        },
        icon: {
          color: DARK_COLORS.inputBorder,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "outlined",
        color: "secondary",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlinedSecondary: {
          background: DARK_COLORS.foreground,
          border: "1px solid",
          borderColor: DARK_COLORS.commonBorder,
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: "small",
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          display: "flex",
          borderRadius: 8,
          background: DARK_COLORS.foreground,
          border: "1px solid",
          borderColor: DARK_COLORS.commonBorder,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation: {
          background: DARK_COLORS.foreground,
          border: "1px solid",
          borderColor: DARK_COLORS.commonBorder,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: DARK_COLORS.text,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: DARK_COLORS.text,
            fontWeight: "bold",
          },
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
