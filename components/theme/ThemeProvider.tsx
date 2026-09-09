"use client";

import React, {
  createContext,
  useContext,
  useEffect,
} from "react";

import { usePersistentState } from "../hooks/usePersistentState";

export type AppTheme =
  | "comic"
  | "elegant"
  | "classic";

type ThemeContextValue = {
  appTheme: AppTheme;
  setAppTheme: React.Dispatch<
    React.SetStateAction<AppTheme>
  >;
};

const ThemeContext =
  createContext<ThemeContextValue | null>(
    null
  );

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appTheme, setAppTheme] =
    usePersistentState<AppTheme>(
      "affirmme_theme_v1",
      "comic"
    );

  useEffect(() => {
    document.documentElement.dataset.theme =
      appTheme;
  }, [appTheme]);

  return (
    <ThemeContext.Provider
      value={{
        appTheme,
        setAppTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}