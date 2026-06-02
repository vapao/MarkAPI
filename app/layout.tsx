import type { Metadata } from "next";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "MarkAPI",
  description: "内部 Markdown API 文档浏览器"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
