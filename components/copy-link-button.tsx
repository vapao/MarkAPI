"use client";

import { useState } from "react";
import { writeClipboardText } from "@/lib/client-clipboard";

type CopyLinkButtonProps = {
  value: string;
};

export function CopyLinkButton({ value }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await writeClipboardText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    window.setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <button className="button button-secondary" type="button" onClick={handleCopy}>
      {status === "copied" ? "已复制" : status === "failed" ? "复制失败" : "复制链接"}
    </button>
  );
}
