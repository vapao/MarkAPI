import { headers } from "next/headers";
import { localizedPath, type Locale } from "@/lib/locales";

export async function getShareUrl(token: string, locale: Locale) {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    throw new Error("Request host is required to build share URL");
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}${localizedPath(locale, `/docs/${token}`)}`;
}
