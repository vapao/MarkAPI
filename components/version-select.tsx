"use client";

import { useRouter } from "next/navigation";

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

  return (
    <label className="version-select">
      <span>版本</span>
      <select
        value={currentVersionId}
        onChange={(event) => {
          router.push(`/docs/${token}?version=${event.target.value}`);
        }}
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.label}
          </option>
        ))}
      </select>
    </label>
  );
}
