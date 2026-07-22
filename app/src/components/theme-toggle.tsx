"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "astra-theme";

/**
 * Sun/moon theme switch. The `dark` class on <html> is the single source of
 * truth: layout.tsx renders it by default and an inline pre-paint script
 * removes it when localStorage says light. Icon visibility is pure CSS
 * (dark:hidden / dark:block), so this renders identically on server and
 * client — no hydration concerns, no state.
 */
export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — theme still switches for this page view
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light / dark theme"
      title="Toggle light / dark theme"
      className="rounded-full border border-slate-300 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden />
    </button>
  );
}
