import { notFound } from "next/navigation";
import { isLocale } from "@/lib/locales";

export function resolveLocale(locale: string) {
  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
}
