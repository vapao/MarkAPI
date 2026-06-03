"use client";

import { useId, useState } from "react";

type MarkdownFileFieldProps = {
  labels: {
    browse: string;
    choose: string;
    emptyHint: string;
    label: string;
    selectedHint: string;
  };
};

export function MarkdownFileField({ labels }: MarkdownFileFieldProps) {
  const inputId = useId();
  const [fileName, setFileName] = useState("");

  return (
    <label className="file-field" htmlFor={inputId}>
      <span className="file-field-label">{labels.label}</span>
      <span className="file-dropzone">
        <span className="file-mark">MD</span>
        <span className="file-copy">
          <span className="file-title">{fileName || labels.choose}</span>
          <span className="file-hint">
            {fileName ? labels.selectedHint : labels.emptyHint}
          </span>
        </span>
        <span className="file-action">{labels.browse}</span>
      </span>
      <input
        id={inputId}
        className="file-input"
        required
        type="file"
        name="file"
        accept=".md,text/markdown"
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name ?? "");
        }}
      />
    </label>
  );
}
