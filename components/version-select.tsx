"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { localizedPath, type Locale } from "@/lib/locales";

type VersionOption = {
  id: number;
  label: string;
};

type VersionSelectProps = {
  currentVersionId: number;
  labels: {
    loading: string;
    selectVersion: string;
    switchVersion: string;
    version: string;
  };
  locale: Locale;
  token: string;
  versions: VersionOption[];
};

export function VersionSelect({
  currentVersionId,
  labels,
  locale,
  token,
  versions
}: VersionSelectProps) {
  const router = useRouter();
  const versionSelectRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingVersionId, setPendingVersionId] = useState<number | null>(null);
  const selectedVersionId = pendingVersionId ?? currentVersionId;
  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const isLoading = isPending || pendingVersionId !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!versionSelectRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openVersion(versionId: number) {
    if (versionId === currentVersionId) {
      setPendingVersionId(null);
      setIsOpen(false);
      return;
    }

    setPendingVersionId(versionId);
    setIsOpen(false);
    startTransition(() => {
      router.push(`${localizedPath(locale, `/docs/${token}`)}?version=${versionId}`);
    });
  }

  return (
    <div className="version-select" ref={versionSelectRef}>
      <span className="version-select-label">{labels.version}</span>
      <button
        aria-busy={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="version-select-trigger"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="version-select-trigger-text">{selectedVersion?.label ?? labels.selectVersion}</span>
        <span
          aria-hidden="true"
          className={isLoading ? "version-select-spinner" : "version-select-caret"}
        />
      </button>
      {isOpen ? (
        <div className="version-select-menu" aria-label={labels.switchVersion}>
          {versions.map((version) => {
            const isSelected = version.id === selectedVersionId;

            return (
              <button
                className="version-select-option"
                disabled={isSelected}
                key={version.id}
                type="button"
                onClick={() => openVersion(version.id)}
              >
                <span aria-hidden="true" className="version-select-check">
                  {isSelected ? "✓" : ""}
                </span>
                <span className="version-select-option-label">{version.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {isLoading ? (
        <span className="version-select-status" role="status" aria-live="polite">
          {labels.loading}
        </span>
      ) : null}
    </div>
  );
}
