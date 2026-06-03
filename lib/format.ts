import type { Locale } from "@/lib/locales";

const compactDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const dateTimeFormatters: Record<Locale, Intl.DateTimeFormat> = {
  zh: compactDateTimeFormatter,
  en: compactDateTimeFormatter
};

export function formatDateTime(date: Date, locale: Locale) {
  return dateTimeFormatters[locale].format(date).replace(",", "");
}
