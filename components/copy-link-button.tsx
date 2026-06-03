"use client";

import { useState } from "react";
import { writeClipboardText } from "@/lib/client-clipboard";

type CopyLinkButtonProps = {
  labels: {
    copied: string;
    copyLink: string;
    failed: string;
  };
  value: string;
};

export function CopyLinkButton({ labels, value }: CopyLinkButtonProps) {
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
      {status === "copied" ? labels.copied : status === "failed" ? labels.failed : labels.copyLink}
    </button>
  );
}
