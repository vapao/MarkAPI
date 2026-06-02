import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dmark",
  description: "内部 Markdown API 文档浏览器"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
