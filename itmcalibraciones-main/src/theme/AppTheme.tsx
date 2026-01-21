import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import type { ThemeOptions, PaletteMode } from "@mui/material";
import {
  ReactNode,
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
} from "react";

// Augmented palette for custom colors if needed
declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

// Contexto para manejar el modo de color
interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: "light" | "dark";
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: "light",
});

export const useColorMode = () => useContext(ColorModeContext);

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: "#1565C0",
      light: "#5E92F3",
      dark: "#003C8F",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#263238",
    },
    neutral: {
      main: mode === "light" ? "#64748B" : "#94A3B8",
      light: mode === "light" ? "#F1F5F9" : "#1E293B",
      dark: mode === "light" ? "#334155" : "#E2E8F0",
      contrastText: "#fff",
    },
    background: {
      default: mode === "light" ? "#F4F6F8" : "#0F172A", // Dark Slate 900
      paper: mode === "light" ? "#FFFFFF" : "#1E293B", // Dark Slate 800
    },
    text: {
      primary: mode === "light" ? "#1E293B" : "#F8FAFC", // Slate 900 / Slate 50
      secondary: mode === "light" ? "#64748B" : "#CBD5E1", // Slate 500 / Slate 300
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              mode === "light"
                ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                : "0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)",
          },
        },
        contained: {
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            mode === "light"
              ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
              : "0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow:
            mode === "light"
              ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
              : "0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow:
            mode === "light" ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none",
          background: mode === "light" ? "#ffffff" : "#1E293B",
          borderBottom: mode === "dark" ? "1px solid #334155" : "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === "light" ? "#FFFFFF" : "#1E293B",
          borderRight:
            mode === "light"
              ? "1px solid rgba(0,0,0,0.08)"
              : "1px solid #334155",
        },
      },
    },
  },
});

interface AppThemeProps {
  children: ReactNode;
}

export const AppTheme = ({ children }: AppThemeProps) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    // Intenta leer del localStorage, defecto 'light'
    const savedMode = localStorage.getItem("themeMode");
    return savedMode === "light" || savedMode === "dark" ? savedMode : "light";
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
