"use client";

import { Fragment, type ReactNode, useState } from "react";
import { Check, Copy } from "lucide-react";
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
  labels: {
    clickToCopy: string;
    copied: string;
    copyCode: string;
    copyField: string;
  };
};

function indent(depth: number) {
  return "  ".repeat(depth);
}

function jsonString(value: string) {
  return JSON.stringify(value);
}

export function JsonCodeBlock({ code, labels }: JsonCodeBlockProps) {
  const [copiedBlock, setCopiedBlock] = useState(false);
  const [copiedFieldId, setCopiedFieldId] = useState("");
  let value: JsonValue;

  async function handleCopyBlock() {
    try {
      await writeClipboardText(code);
      setCopiedBlock(true);
      window.setTimeout(() => setCopiedBlock(false), 1000);
    } catch {
      setCopiedBlock(false);
    }
  }

  function renderShell(children: ReactNode) {
    return (
      <div className="json-code-shell">
        <button
          aria-label={copiedBlock ? labels.copied : labels.copyCode}
          className={copiedBlock ? "json-code-copy json-code-copy-copied" : "json-code-copy"}
          onClick={handleCopyBlock}
          title={copiedBlock ? labels.copied : labels.copyCode}
          type="button"
        >
          {copiedBlock ? (
            <Check aria-hidden="true" size={15} strokeWidth={2.5} />
          ) : (
            <Copy aria-hidden="true" size={15} strokeWidth={2.25} />
          )}
        </button>
        <pre className="json-code-block">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  try {
    value = JSON.parse(code) as JsonValue;
  } catch {
    return renderShell(code);
  }

  async function handleCopy(key: string, fieldId: string) {
    try {
      await writeClipboardText(key);
      setCopiedFieldId(fieldId);
      window.setTimeout(() => setCopiedFieldId(""), 1000);
    } catch {
      setCopiedFieldId("");
    }
  }

  function renderValue(item: JsonValue, depth: number, path: string): ReactNode {
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
              {renderValue(entry, depth + 1, `${path}[${index}]`)}
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
        {entries.map(([key, entry], index) => {
          const fieldId = `${path}.${index}:${key}`;

          return (
            <Fragment key={fieldId}>
              {indent(depth + 1)}
              <button
                aria-label={`${labels.copyField} ${key}`}
                className={fieldId === copiedFieldId ? "json-field-name json-field-name-copied" : "json-field-name"}
                onClick={() => handleCopy(key, fieldId)}
                title={labels.clickToCopy}
                type="button"
              >
                {jsonString(key)}
              </button>
              <span className="json-punctuation">: </span>
              {renderValue(entry, depth + 1, fieldId)}
              {index < entries.length - 1 ? <span className="json-punctuation">,</span> : null}
              {"\n"}
            </Fragment>
          );
        })}
        {indent(depth)}
        <span className="json-punctuation">{"}"}</span>
      </>
    );
  }

  return renderShell(renderValue(value, 0, "$"));
}
