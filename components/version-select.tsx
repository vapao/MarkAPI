"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type VersionOption = {
  id: number;
  label: string;
};

type VersionSelectProps = {
  token: string;
  currentVersionId: number;
  versions: VersionOption[];
};

export function VersionSelect({
  token,
  currentVersionId,
  versions
}: VersionSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingVersionId, setPendingVersionId] = useState<number | null>(null);
  const selectedVersionId = pendingVersionId ?? currentVersionId;
  const isLoading = isPending || pendingVersionId !== null;

  return (
    <label className="version-select">
      <span>版本</span>
      <span className="version-select-control">
        <select
          aria-busy={isLoading}
          value={selectedVersionId}
          onChange={(event) => {
            const nextVersionId = Number(event.target.value);

            if (nextVersionId === currentVersionId) {
              setPendingVersionId(null);
              return;
            }

            setPendingVersionId(nextVersionId);
            startTransition(() => {
              router.push(`/docs/${token}?version=${nextVersionId}`);
            });
          }}
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.label}
            </option>
          ))}
        </select>
      </span>
      {isLoading ? (
        <span className="version-select-status" role="status" aria-live="polite">
          加载中
        </span>
      ) : null}
    </label>
  );
}
