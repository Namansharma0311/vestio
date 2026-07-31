import React, { createContext, useContext, useEffect, useState } from "react";

const THEMES = {
  default: {
    label: "Default",
    canvas: "#FAF7F1",
    surface: "#FFFFFF",
    ink: "#21201D",
    accent: "#4B5C3F",
    accentHover: "#36402F",
    danger: "#A8623F",
    border: "#DEDACE",
    muted: "rgba(33,32,29,0.5)",
    grid: "rgba(0,0,0,0.08)",
  },
  light: {
    label: "Light Mode",
    canvas: "#FFFFFF",
    surface: "#F5F5F5",
    ink: "#1A1A1A",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    danger: "#DC2626",
    border: "#E5E7EB",
    muted: "rgba(0,0,0,0.45)",
    grid: "rgba(0,0,0,0.07)",
  },
  dark: {
    label: "Dark Mode",
    canvas: "#121212",
    surface: "#1E1E1E",
    ink: "#E0E0E0",
    accent: "#90EE90",
    accentHover: "#6BCB6B",
    danger: "#FF6B6B",
    border: "#333333",
    muted: "rgba(224,224,224,0.5)",
    grid: "rgba(255,255,255,0.1)",
  },
  cherry: {
    label: "Cherry Red",
    canvas: "#FFF5F5",
    surface: "#FFFFFF",
    ink: "#1A0505",
    accent: "#DC2840",
    accentHover: "#B91C32",
    danger: "#991B1B",
    border: "#FECACA",
    muted: "rgba(26,5,5,0.5)",
    grid: "rgba(0,0,0,0.07)",
  },
  cherryBlack: {
    label: "Cherry Red + Black",
    canvas: "#0A0A0A",
    surface: "#1A1A1A",
    ink: "#F5F5F5",
    accent: "#DC2840",
    accentHover: "#B91C32",
    danger: "#EF4444",
    border: "#333333",
    muted: "rgba(245,245,245,0.5)",
    grid: "rgba(255,255,255,0.09)",
  },
  cherryCream: {
    label: "Cherry Red + Cream",
    canvas: "#FFF8F0",
    surface: "#FFFFFF",
    ink: "#1A0800",
    accent: "#DC2840",
    accentHover: "#B91C32",
    danger: "#991B1B",
    border: "#F0DCC8",
    muted: "rgba(26,8,0,0.5)",
    grid: "rgba(0,0,0,0.06)",
  },
  typoMax: {
    label: "Typography Maximalist",
    canvas: "#F5F0E8",
    surface: "#FFFFFF",
    ink: "#000000",
    accent: "#D62828",
    accentHover: "#A31D1D",
    danger: "#FF4136",
    border: "#000000",
    muted: "rgba(0,0,0,0.4)",
    grid: "rgba(0,0,0,0.06)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem("ck_theme") || "default");
  const theme = THEMES[themeId] || THEMES.default;

  useEffect(() => {
    localStorage.setItem("ck_theme", themeId);
    const r = document.documentElement.style;
    r.setProperty("--c-canvas", theme.canvas);
    r.setProperty("--c-surface", theme.surface);
    r.setProperty("--c-ink", theme.ink);
    r.setProperty("--c-accent", theme.accent);
    r.setProperty("--c-accent-hover", theme.accentHover);
    r.setProperty("--c-danger", theme.danger);
    r.setProperty("--c-border", theme.border);
    r.setProperty("--c-muted", theme.muted);
    r.setProperty("--c-grid", theme.grid);

    if (themeId === "dark") {
      document.documentElement.classList.add("theme-glass");
      document.documentElement.classList.remove("theme-typo");
    } else if (themeId === "typoMax") {
      document.documentElement.classList.remove("theme-glass");
      document.documentElement.classList.add("theme-typo");
    } else {
      document.documentElement.classList.remove("theme-glass");
      document.documentElement.classList.remove("theme-typo");
    }
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
