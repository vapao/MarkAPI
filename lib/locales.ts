export const DEFAULT_LOCALE = "zh";
export const LOCALE_HEADER = "x-markapi-locale";
export const SUPPORTED_LOCALES = ["zh", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const HTML_LANG: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US"
};

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function localizedPath(locale: Locale, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function readFormLocale(formData: FormData) {
  const value = formData.get("locale");
  const locale = typeof value === "string" ? value : null;

  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
