"use client";

import { useSyncExternalStore } from "react";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "markapi:theme";
const THEME_CHANGE_EVENT = "markapi:theme-change";
const THEME_OPTIONS: { label: string; title: string; value: ThemeChoice }[] = [
  { label: "系", title: "跟随系统", value: "system" },
  { label: "亮", title: "浅色模式", value: "light" },
  { label: "暗", title: "深色模式", value: "dark" }
];

function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentChoice() {
  const domChoice = document.documentElement.dataset.themeChoice;

  if (isThemeChoice(domChoice ?? null)) {
    return domChoice;
  }

  const storedChoice = localStorage.getItem(STORAGE_KEY);

  return isThemeChoice(storedChoice) ? storedChoice : "system";
}

function applyTheme(choice: ThemeChoice) {
  const resolvedTheme = choice === "system" ? getSystemTheme() : choice;
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themeChoice = choice;
  root.style.colorScheme = resolvedTheme;
}

function themeSnapshot() {
  if (typeof document === "undefined") {
    return "system";
  }

  return currentChoice();
}

function subscribeTheme(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => {
    if (currentChoice() === "system") {
      applyTheme("system");
      listener();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, listener);
  media.addEventListener("change", handleMediaChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
    media.removeEventListener("change", handleMediaChange);
  };
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribeTheme, themeSnapshot, () => "system");

  function updateChoice(nextChoice: ThemeChoice) {
    localStorage.setItem(STORAGE_KEY, nextChoice);
    applyTheme(nextChoice);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <div className="theme-toggle" role="group" aria-label="外观主题">
      {THEME_OPTIONS.map((option) => (
        <button
          aria-pressed={choice === option.value}
          className={choice === option.value ? "theme-toggle-button theme-toggle-button-active" : "theme-toggle-button"}
          key={option.value}
          title={option.title}
          type="button"
          onClick={() => updateChoice(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
