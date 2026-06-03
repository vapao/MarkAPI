import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { HTML_LANG, DEFAULT_LOCALE, isLocale, LOCALE_HEADER } from "@/lib/locales";
import { getMessages } from "@/lib/messages";

const themeScript = `
(() => {
  const storageKey = "markapi:theme";
  const storedChoice = localStorage.getItem(storageKey);
  const choice = storedChoice === "light" || storedChoice === "dark" || storedChoice === "system" ? storedChoice : "system";
  const resolvedTheme = choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : choice === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.style.colorScheme = resolvedTheme;
})();
`;

async function getRequestLocale() {
  const headerStore = await headers();
  const locale = headerStore.get(LOCALE_HEADER);

  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: "MarkAPI",
    description: getMessages(locale).metadata.description
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={HTML_LANG[locale]} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
