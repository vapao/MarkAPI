"use client";

import { Check, Monitor, Moon, Settings, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { isLocale, SUPPORTED_LOCALES, type Locale } from "@/lib/locales";
import type { Messages } from "@/lib/messages";

type ThemeChoice = "system" | "light" | "dark";

type SettingsMenuProps = {
  children?: ReactNode;
  labels: {
    locale: Messages["components"]["locale"];
    settings: Messages["components"]["settings"];
    theme: Messages["components"]["theme"];
  };
  locale: Locale;
};

const STORAGE_KEY = "markapi:theme";
const THEME_CHANGE_EVENT = "markapi:theme-change";
const THEME_OPTIONS: { Icon: LucideIcon; value: ThemeChoice }[] = [
  { Icon: Monitor, value: "system" },
  { Icon: Sun, value: "light" },
  { Icon: Moon, value: "dark" }
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

function buildLocalePath(pathname: string, locale: Locale) {
  const segments = pathname.split("/");

  if (isLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function SettingsMenu({ children, labels, locale }: SettingsMenuProps) {
  const choice = useSyncExternalStore(subscribeTheme, themeSnapshot, () => "system");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }

    const query = searchParams.toString();
    const nextPath = buildLocalePath(pathname, nextLocale);

    setIsOpen(false);
    startTransition(() => {
      router.push(query ? `${nextPath}?${query}` : nextPath);
    });
  }

  function updateChoice(nextChoice: ThemeChoice) {
    localStorage.setItem(STORAGE_KEY, nextChoice);
    applyTheme(nextChoice);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    setIsOpen(false);
  }

  return (
    <div className="settings-menu" ref={menuRef}>
      <button
        aria-busy={isPending}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={labels.settings.label}
        className="settings-menu-trigger"
        title={labels.settings.label}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Settings aria-hidden="true" size={16} strokeWidth={2.25} />
      </button>
      {isOpen ? (
        <div className="settings-menu-popover" role="menu" aria-label={labels.settings.label}>
          <div className="settings-menu-section">
            <div className="settings-menu-heading">
              {labels.locale.label}
            </div>
            <div className="settings-menu-options">
              {SUPPORTED_LOCALES.map((option) => (
                <button
                  aria-checked={option === locale}
                  className={option === locale ? "settings-menu-option settings-menu-option-active" : "settings-menu-option"}
                  disabled={isPending}
                  key={option}
                  role="menuitemradio"
                  type="button"
                  onClick={() => switchLocale(option)}
                >
                  <span>{labels.locale[option]}</span>
                  {option === locale ? <Check aria-hidden="true" size={15} strokeWidth={2.5} /> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-menu-section">
            <div className="settings-menu-heading">
              {labels.theme.label}
            </div>
            <div className="settings-menu-options">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.Icon;

                return (
                  <button
                    aria-checked={option.value === choice}
                    className={option.value === choice ? "settings-menu-option settings-menu-option-active" : "settings-menu-option"}
                    key={option.value}
                    role="menuitemradio"
                    type="button"
                    onClick={() => updateChoice(option.value)}
                  >
                    <span className="settings-menu-option-label">
                      <Icon aria-hidden="true" size={15} strokeWidth={2.25} />
                      <span>{labels.theme[option.value]}</span>
                    </span>
                    {option.value === choice ? <Check aria-hidden="true" size={15} strokeWidth={2.5} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
          {children ? (
            <div className="settings-menu-section settings-menu-section-separated">
              <div className="settings-menu-options">{children}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
