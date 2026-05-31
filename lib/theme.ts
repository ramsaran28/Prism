export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "prism-theme";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
