"use client";

import { useId, useRef } from "react";
import type { Locale } from "@/lib/locales";
import type { Messages } from "@/lib/messages";

type ProjectPublicAccessFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  checked: boolean;
  labels: Pick<
    Messages["admin"]["project"],
    "allowPublicVersionHistory" | "allowPublicVersionHistoryHelp"
  >;
  locale: Locale;
};

export function ProjectPublicAccessForm({
  action,
  checked,
  labels,
  locale
}: ProjectPublicAccessFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const helpId = useId();

  return (
    <form action={action} className="public-access-setting" ref={formRef}>
      <input type="hidden" name="locale" value={locale} />
      <label className="public-access-toggle">
        <input
          aria-describedby={helpId}
          className="public-access-switch-input"
          defaultChecked={checked}
          name="allowPublicVersionHistory"
          role="switch"
          type="checkbox"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <span aria-hidden="true" className="public-access-switch" />
        <span className="public-access-copy">
          <span className="public-access-title">{labels.allowPublicVersionHistory}</span>
          <span className="public-access-help" id={helpId}>
            {labels.allowPublicVersionHistoryHelp}
          </span>
        </span>
      </label>
    </form>
  );
}
