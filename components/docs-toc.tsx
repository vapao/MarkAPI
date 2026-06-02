"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

type DocsTocProps = {
  items: TocItem[];
};

export function DocsToc({ items }: DocsTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      return;
    }

    const docsContent = document.querySelector<HTMLElement>(".docs-content");
    const root =
      docsContent &&
      getComputedStyle(docsContent).overflowY === "auto" &&
      docsContent.scrollHeight > docsContent.clientHeight
        ? docsContent
        : null;
    const scrollTarget = root ?? window;
    let animationFrame = 0;
    const queueActiveUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const rootTop = root ? root.getBoundingClientRect().top : 0;
        const scrollMarginTop = Number.parseFloat(getComputedStyle(headings[0]).scrollMarginTop) || 0;
        const activationTop = rootTop + scrollMarginTop + 16;
        const activeHeading =
          headings.filter((heading) => heading.getBoundingClientRect().top <= activationTop).at(-1) ??
          headings[0];

        setActiveId(activeHeading.id);
      });
    };

    scrollTarget.addEventListener("scroll", queueActiveUpdate, { passive: true });
    window.addEventListener("resize", queueActiveUpdate);
    queueActiveUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      scrollTarget.removeEventListener("scroll", queueActiveUpdate);
      window.removeEventListener("resize", queueActiveUpdate);
    };
  }, [items]);

  if (items.length === 0) {
    return <p className="empty-text">当前文档没有二级或三级标题。</p>;
  }

  return (
    <nav aria-label="目录" className="toc-list">
      {items.map((item) => {
        const className = [
          "toc-item",
          item.depth === 2 ? "toc-item-nested" : "",
          item.id === activeId ? "toc-item-active" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <a
            aria-current={item.id === activeId ? "location" : undefined}
            className={className}
            href={`#${item.id}`}
            key={item.id}
            onClick={() => setActiveId(item.id)}
          >
            {item.text}
          </a>
        );
      })}
    </nav>
  );
}
