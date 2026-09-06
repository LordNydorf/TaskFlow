import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useTheme() {
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  };

  const [theme, setTheme] = useLocalStorage("taskflow_theme", getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggleTheme };
}
