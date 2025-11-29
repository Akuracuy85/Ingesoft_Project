import { useCallback, useLayoutEffect, useState } from "react";

type ThemeMode = "dark" | "light" | "system";

const readStoredTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light" || saved === "system") return saved as ThemeMode;
  } catch (e) {
    // ignore
  }
  return "system";
};

const prefersDarkNow = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyThemeToDocument = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (!root) return;

  if (mode === "dark") {
    root.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
    } catch (e) {}
  } else if (mode === "light") {
    root.classList.remove("dark");
    try {
      localStorage.setItem("theme", "light");
    } catch (e) {}
  } else {
    // system
    try {
      localStorage.setItem("theme", "system");
    } catch (e) {}
    if (prefersDarkNow()) root.classList.add("dark");
    else root.classList.remove("dark");
  }
};

export function useDarkMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme());

  // Apply on mount / when themeMode changes so toggles and setTheme are effective
  useLayoutEffect(() => {
    applyThemeToDocument(themeMode);
  }, [themeMode]);

  const toggleDarkMode = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  const isDark = themeMode === "dark" ? true : themeMode === "light" ? false : prefersDarkNow();

  return { isDark, themeMode, toggleDarkMode, setTheme } as const;
}
