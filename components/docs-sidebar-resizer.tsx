"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MIN_CONTENT_WIDTH = 680;
const RESIZER_WIDTH = 8;
const KEYBOARD_STEP = 20;
const STORAGE_KEY_PREFIX = "markapi:docs-sidebar-width:";

type DocsSidebarResizerProps = {
  label: string;
  projectToken: string;
};

function getLocalStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function getMaxWidth(shell: HTMLElement) {
  return Math.max(MIN_WIDTH, shell.clientWidth - MIN_CONTENT_WIDTH - RESIZER_WIDTH);
}

function clampWidth(width: number, maxWidth: number) {
  return Math.min(Math.max(width, MIN_WIDTH), maxWidth);
}

export function DocsSidebarResizer({ label, projectToken }: DocsSidebarResizerProps) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const preferredWidthRef = useRef(DEFAULT_WIDTH);
  const currentWidthRef = useRef(DEFAULT_WIDTH);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_WIDTH);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [maxWidth, setMaxWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const getShell = useCallback(() => {
    return resizerRef.current?.closest<HTMLElement>(".docs-shell") ?? null;
  }, []);

  const applyWidth = useCallback((nextWidth: number, shouldPersist = false) => {
    const shell = getShell();

    if (!shell) {
      return;
    }

    const nextMaxWidth = getMaxWidth(shell);
    const clampedWidth = clampWidth(nextWidth, nextMaxWidth);

    preferredWidthRef.current = shouldPersist ? clampedWidth : nextWidth;
    currentWidthRef.current = clampedWidth;
    shell.style.setProperty("--docs-sidebar-width", `${clampedWidth}px`);
    setMaxWidth(nextMaxWidth);
    setWidth(clampedWidth);

    if (shouldPersist) {
      getLocalStorage()?.setItem(`${STORAGE_KEY_PREFIX}${projectToken}`, String(clampedWidth));
    }
  }, [getShell, projectToken]);

  useEffect(() => {
    const storage = getLocalStorage();
    const storedWidth = Number.parseInt(storage?.getItem(`${STORAGE_KEY_PREFIX}${projectToken}`) ?? "", 10);

    preferredWidthRef.current = Number.isFinite(storedWidth) ? storedWidth : DEFAULT_WIDTH;

    const syncWidth = () => {
      applyWidth(preferredWidthRef.current);
    };

    syncWidth();
    window.addEventListener("resize", syncWidth);

    return () => {
      window.removeEventListener("resize", syncWidth);
    };
  }, [applyWidth, projectToken]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      applyWidth(dragStartWidthRef.current + event.clientX - dragStartXRef.current);
    };

    const handlePointerUp = () => {
      applyWidth(currentWidthRef.current, true);
      setIsDragging(false);
    };

    document.documentElement.classList.add("docs-sidebar-resizing");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    window.addEventListener("pointercancel", handlePointerUp, { once: true });

    return () => {
      document.documentElement.classList.remove("docs-sidebar-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [applyWidth, isDragging]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    dragStartXRef.current = event.clientX;
    dragStartWidthRef.current = currentWidthRef.current;
    setIsDragging(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      applyWidth(currentWidthRef.current - KEYBOARD_STEP, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      applyWidth(currentWidthRef.current + KEYBOARD_STEP, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      applyWidth(MIN_WIDTH, true);
    } else if (event.key === "End") {
      event.preventDefault();
      applyWidth(maxWidth, true);
    }
  }

  return (
    <div
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemax={maxWidth}
      aria-valuemin={MIN_WIDTH}
      aria-valuenow={width}
      className="docs-sidebar-resizer"
      ref={resizerRef}
      role="separator"
      tabIndex={0}
      title={label}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
    />
  );
}
