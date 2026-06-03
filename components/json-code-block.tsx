"use client";

import { Fragment, type ReactNode, useState } from "react";
import { writeClipboardText } from "@/lib/client-clipboard";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonCodeBlockProps = {
  code: string;
};

function indent(depth: number) {
  return "  ".repeat(depth);
}

function jsonString(value: string) {
  return JSON.stringify(value);
}

export function JsonCodeBlock({ code }: JsonCodeBlockProps) {
  const [copiedKey, setCopiedKey] = useState("");
  let value: JsonValue;

  try {
    value = JSON.parse(code) as JsonValue;
  } catch {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }

  async function handleCopy(key: string) {
    try {
      await writeClipboardText(key);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1000);
    } catch {
      setCopiedKey("");
    }
  }

  function renderValue(item: JsonValue, depth: number): ReactNode {
    if (item === null) {
      return <span className="json-null">null</span>;
    }

    if (typeof item === "string") {
      return <span className="json-string">{jsonString(item)}</span>;
    }

    if (typeof item === "number") {
      return <span className="json-number">{item}</span>;
    }

    if (typeof item === "boolean") {
      return <span className="json-boolean">{String(item)}</span>;
    }

    if (Array.isArray(item)) {
      if (item.length === 0) {
        return <span className="json-punctuation">[]</span>;
      }

      return (
        <>
          <span className="json-punctuation">[</span>
          {"\n"}
          {item.map((entry, index) => (
            <Fragment key={index}>
              {indent(depth + 1)}
              {renderValue(entry, depth + 1)}
              {index < item.length - 1 ? <span className="json-punctuation">,</span> : null}
              {"\n"}
            </Fragment>
          ))}
          {indent(depth)}
          <span className="json-punctuation">]</span>
        </>
      );
    }

    const entries = Object.entries(item);

    if (entries.length === 0) {
      return <span className="json-punctuation">{"{}"}</span>;
    }

    return (
      <>
        <span className="json-punctuation">{"{"}</span>
        {"\n"}
        {entries.map(([key, entry], index) => (
          <Fragment key={key}>
            {indent(depth + 1)}
            <button
              aria-label={`复制字段名 ${key}`}
              className={key === copiedKey ? "json-field-name json-field-name-copied" : "json-field-name"}
              onClick={() => handleCopy(key)}
              title="点击复制字段名"
              type="button"
            >
              {jsonString(key)}
            </button>
            <span className="json-punctuation">: </span>
            {renderValue(entry, depth + 1)}
            {index < entries.length - 1 ? <span className="json-punctuation">,</span> : null}
            {"\n"}
          </Fragment>
        ))}
        {indent(depth)}
        <span className="json-punctuation">{"}"}</span>
      </>
    );
  }

  return (
    <pre className="json-code-block">
      <code>{renderValue(value, 0)}</code>
    </pre>
  );
}
