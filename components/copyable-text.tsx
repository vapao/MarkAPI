"use client";

import { type ReactNode, useState } from "react";
import { writeClipboardText } from "@/lib/client-clipboard";

type CopyableTextProps = {
  children?: ReactNode;
  className?: string;
  label: string;
  title?: string;
  value: string;
};

export function CopyableText({
  children,
  className = "copy-token",
  label,
  title = "点击复制",
  value
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await writeClipboardText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 650);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={`${label} ${value}`}
      className={copied ? `${className} copy-token-copied` : className}
      onClick={handleCopy}
      title={title}
      type="button"
    >
      {children ?? value}
    </button>
  );
}
