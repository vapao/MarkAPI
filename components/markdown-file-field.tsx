"use client";

import { useId, useState } from "react";

export function MarkdownFileField() {
  const inputId = useId();
  const [fileName, setFileName] = useState("");

  return (
    <label className="file-field" htmlFor={inputId}>
      <span className="file-field-label">Markdown 文件</span>
      <span className="file-dropzone">
        <span className="file-mark">MD</span>
        <span className="file-copy">
          <span className="file-title">{fileName || "选择 Markdown 文件"}</span>
          <span className="file-hint">
            {fileName ? "已选择，提交后会生成新版本" : "支持 .md 文件，最大 2MB"}
          </span>
        </span>
        <span className="file-action">浏览文件</span>
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
