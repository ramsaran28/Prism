"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  const label =
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="theme-toggle"
      aria-label={label}
      title={label}
      aria-pressed={mounted ? theme === "dark" : undefined}
    >
      {!mounted ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      ) : theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
