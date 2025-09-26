// src/ThemeContext.js
import React, { createContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

export const ThemeModeContext = createContext();

export default function ThemeModeProvider({ children }) {
  // وضعیت تم: 'light', 'dark', یا 'system'
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "system");

  // تشخیص تم سیستم
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // وقتی کاربر تم رو عوض می‌کنه، توی localStorage ذخیره کن
  const setThemeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  // لیسنر برای تغییر تم سیستم
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setMode((prev) =>
      prev === "system" ? "system" : prev
    );
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // ساخت تم MUI
  const theme = useMemo(
    () =>
      createTheme({
        direction: "rtl", // چون سایتت فارسیه
        typography: {
          fontFamily: "Vazirmatn, Arial",
        },
        palette: {
          mode: resolvedMode,
          primary: {
            main: "#1976d2",
          },
        },
      }),
    [resolvedMode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, setThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
