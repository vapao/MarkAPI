"use client";

export async function writeClipboardText(value: string) {
  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }

  if (copied) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  throw new Error("Copy command failed");
}
